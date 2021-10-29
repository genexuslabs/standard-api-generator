"use strict";

function preprocessCommon(metadata, options) {
  /**
   * Removes ignored elements (options["ignored"])
   * Adds "generateClass" information
   * Merges overloaded methods into one with optional parameters
   * Renames methods that require disambiguation (options["disambiguated"])
   */
  if (!metadata.definitions) {
    return metadata;
  }

  metadata = removeIgnored(metadata, options);
  metadata = addGenerateClassInformation(metadata, options);
  metadata = mergeOverloadedMethods(metadata);
  metadata = disambiguateElements(metadata, options);

  return metadata;
}

function preprocessForTypescriptAPI(metadata, options) {
  /**
   * Removes already implemented elements (options["implemented"])
   * Performs all common preprocessor functions
   */
  if (!metadata.definitions) {
    return metadata;
  }

  metadata = removeImplemented(metadata, options);
  metadata = preprocessCommon(metadata, options);

  return metadata;
}

function preprocessForAngularMetadata(metadata, options) {
  /**
   * Adds implemented methods' information
   * Performs all common preprocessor functions
   */
  if (!metadata.definitions) {
    return metadata;
  }

  metadata = addImplementedInfo(metadata, options);
  metadata = preprocessCommon(metadata, options);

  return metadata;
}

function removeImplemented(metadata, options) {
  const doNotGenerate = getImplemented(options);
  return removeUnwantedItems(metadata, doNotGenerate);
}

function removeIgnored(metadata, options) {
  const doNotGenerate = getIgnored(options);
  return removeUnwantedItems(metadata, doNotGenerate);
}

function removeUnwantedItems(metadata, doNotGenerate) {
  let resultMetadata = {};
  resultMetadata["definitions"] = metadata.definitions.reduce(
    (reducedDef, def) => {
      const entryName = def.name;
      if (doNotGenerate.includes(entryName)) {
        return reducedDef;
      } else {
        const filterItems = function (result, item) {
          if (doNotGenerate.includes(memberName(entryName, item.name))) {
            return result;
          } else {
            result.push(item);
            return result;
          }
        };

        let resultDef = { ...def };

        if (def.methods) {
          resultDef.methods = def.methods.reduce(filterItems, []);
        }
        if (def.properties) {
          resultDef.properties = def.properties.reduce(filterItems, []);
        }

        reducedDef.push(resultDef);
        return reducedDef;
      }
    },
    []
  );
  return resultMetadata;
}

function addImplementedInfo(metadata, options) {
  const impInfo = getImplementedInfo(options);

  let resultMetadata = {};
  resultMetadata.definitions = metadata.definitions.map(def => {
    let resultDef = { ...def };

    let isImplemented = false;

    const entryName = def.name;
    if (impInfo[entryName]) {
      resultDef["implementationPath"] = impInfo[entryName].path;
      isImplemented = true;
    }

    if (def.methods) {
      resultDef.methods = def.methods.map(meth => {
        let resultMeth = { ...meth };
        let mName = memberName(entryName, meth.name);
        if (impInfo[mName]) {
          resultMeth["implementationPath"] = impInfo[mName].path;
          resultMeth["implementationName"] = impInfo[mName].name;
          resultMeth["implementationAlias"] = impInfo[mName].alias;
          resultMeth["notifiesGenerator"] = impInfo[mName].notifiesGenerator;
          resultMeth["modifiesInstance"] = impInfo[mName].modifiesInstance;
          resultMeth["isAsync"] = impInfo[mName].isAsync;
          isImplemented = true;
        }
        return resultMeth;
      });
    }

    if (def.properties) {
      resultDef.properties = def.properties.map(prop => {
        let resultProp = { ...prop };
        let pName = memberName(entryName, prop.name);
        if (impInfo[pName]) {
          if (impInfo[pName].available) {
            resultProp["unavailable"] = false;
          }
          else {
            resultProp["unavailable"] = true;
          }
          resultProp["asMethod"] = impInfo[pName].asMethod;
        }
        return resultProp;
      });
    }

    resultDef["isImplemented"] = isImplemented;

    return resultDef;
  });

  return resultMetadata;
}

function addGenerateClassInformation(metadata, options) {
  let resultMetadata = {};
  resultMetadata.definitions = metadata.definitions.map(def => {
    let resultDef = { ...def };
    resultDef["generateClass"] = shouldGenerateClass(def, options);
    return resultDef;
  });
  return resultMetadata;
}

function mergeOverloadedMethods(metadata) {
  let resultMetadata = {};
  resultMetadata.definitions = metadata.definitions.map(def => {
    if (def.methods) {
      const mergeOverloads = function (currentMethods, method) {
        let existing = currentMethods.find(current => {
          return current.name == method.name && current.static == method.static;
        });
        if (existing) {
          let params = mergeMethodParameters(
            existing.parameters,
            method.parameters
          );
          existing.parameters = params;
        } else {
          currentMethods.push({ ...method });
        }
        return currentMethods;
      };

      let resultDef = { ...def };
      resultDef.methods = def.methods.reduce(mergeOverloads, []);
      return resultDef;
    } else {
      return def;
    }
  });
  return resultMetadata;
}

function mergeMethodParameters(params1, params2) {
  const makeParameterOptional = function (p) {
    let resultParam = { ...p };
    resultParam["optional"] = true;
    return resultParam;
  };

  if (!params1) {
    return params2.map(makeParameterOptional);
  }
  if (!params2) {
    return params1.map(makeParameterOptional);
  }

  let result = [];
  let commonCount = Math.min(params1.length, params2.length);
  for (let i = 0; i < commonCount; i++) {
    result.push(mergedParameter(params1[i], params2[i]));
  }

  const appendExtraParams = function (pars) {
    if (pars.length > commonCount) {
      result = result.concat(
        pars.slice(commonCount).map(makeParameterOptional)
      );
    }
  };

  appendExtraParams(params1);
  appendExtraParams(params2);

  return result;
}

function mergedParameter(par1, par2) {
  let result = { ...par1 };
  result["type"] = mergeParameterType(par1.type, par2.type);
  result["accesstype"] = mergeAccessType(par1.accessType, par2.accessType);
  result["optional"] =
    boolFromValue(par1.optional) || boolFromValue(par2.optional);
  return result;
}

function boolFromValue(val) {
  if (val == true) {
    return true;
  } else {
    return false;
  }
}

function mergeAccessType(at1, at2) {
  if (!at1 && !at2) {
    return "in";
  } else if (!at1) {
    return at2;
  } else if (!at2) {
    return at1;
  } else {
    if (at1 == at2) {
      return at1;
    } else {
      // either one of them is "inout" and the other is "in" or "out", or one is "in" and the other is "out"
      // anyhow =>
      return "inout";
    }
  }
}

function mergeParameterType(t1, t2) {
  if (!t1 && !t2) {
    return "";
  } else if (!t1) {
    return t2;
  } else if (!t2) {
    return t1;
  } else if (t1 == t2) {
    return t1;
  } else {
    return "any";
  }
}

function getImplemented(options) {
  let implemented = [];
  if (options.implemented) {
    for (let entryKey in options.implemented) {
      let members = options.implemented[entryKey].members;
      if (members) {
        for (let memberKey in members) {
          implemented.push(memberName(entryKey, memberKey));
        }
      } else {
        implemented.push(entryKey);
      }
    }
  }
  return implemented;
}

function getImplementedInfo(options) {
  let implemented = {};
  if (options.implemented) {
    for (let entryKey in options.implemented) {
      let members = options.implemented[entryKey].members;
      if (members) {
        for (let memberKey in members) {
          implemented[memberName(entryKey, memberKey)] = {
            path: members[memberKey].path,
            name: members[memberKey].name,
            alias: members[memberKey].alias,
            notifiesGenerator: members[memberKey].notifiesGenerator,
            modifiesInstance: members[memberKey].modifiesInstance,
            available: members[memberKey].available,
            asMethod: members[memberKey].asMethod,
            isAsync: members[memberKey].isAsync,
          };
        }
      }
      
      let path = options.implemented[entryKey].path
      if (path) {
        implemented[entryKey] = {
          path: path
        };
      }
    }
  }
  return implemented;
}

function getIgnored(options) {
  let ignored = [];
  if (options.ignored) {
    for (let entryKey in options.ignored) {
      const entryValue = options.ignored[entryKey];
      if (entryValue === "all") {
        ignored = ignored.concat(memberName(entryKey));
      } else {
        ignored = ignored.concat(
          entryValue.map(item => memberName(entryKey, item))
        );
      }
    }
  }
  return ignored;
}

function memberName(entry, member = undefined) {
  if (member) {
    return `${entry}::${member}`;
  } else {
    return entry;
  }
}

function shouldGenerateClass(def, options) {
  if (options.implemented) {
    // if already marked as implemented (may be partially implemented), then use the known implementation details
    const impDetails = options.implemented[def.name];
    if (impDetails) {
      return impDetails.path !== undefined;
    }
  }

  // check if not implemented types may generate classes
  if (options.notImplementedSettings) {
    if (options.notImplementedSettings.doNotGenerateClasses === true) {
      return false;
    }
  }

  let genClass = false;

  if (def.methods) {
    genClass = def.methods.reduce((result, method) => {
      return result || !method.static;
    }, false);
  }
  if (!genClass && def.properties) {
    genClass = def.properties.length > 0;
  }
  return genClass;
}

function disambiguateElements(metadata, options) {
  const disambiguations = getDisambiguated(options);
  if (!disambiguations) {
    return metadata;
  }

  let resultMetadata = { ...metadata };
  resultMetadata.definitions = metadata.definitions.map(def => {
    let entryName = def.name;
    const disambiguateItem = function (item) {
      let disambiguationName = memberName(entryName, item.name);
      if (disambiguations[disambiguationName]) {
        let resultItem = { ...item };
        resultItem.implementationName = disambiguations[disambiguationName];
        resultItem.implementationAlias = disambiguations[disambiguationName];
        return resultItem;
      } else {
        return item;
      }
    };

    if (def.methods) {
      let resultDef = { ...def };
      resultDef.methods = def.methods.map(disambiguateItem);
      return resultDef;
    } else {
      return def;
    }
  });
  return resultMetadata;
}

function getDisambiguated(options) {
  if (!options["disambiguated"]) {
    return null;
  }

  let disambiguated = {};
  for (let key in options.disambiguated) {
    let items = options.disambiguated[key];
    for (let item in items) {
      let name = memberName(key, item);
      let value = items[item];
      disambiguated[name] = value;
    }
  }
  return disambiguated;
}

function transformAttributeAndVariableMethods(metadata, options) {
  let methodsToAdd = metadata.definitions
    .filter(def => def.name === "AttributePEM" || def.name === "VariablePEM")
    .reduce((methods, def) => {
      if (def.methods !== undefined) {
        const names = methods.map(meth => meth.name);
        const filteredMethods = def.methods.filter(meth => !names.find(name => name === meth.name));
        return methods.concat(filteredMethods);
      }
      else {
        return methods;
      }
    }, []);

  if (methodsToAdd.count == 0) {
    return metadata;
  }

  const searchTypes = ['Numeric', 'Character', 'Varchar', 'LongVarchar', 'Date', 'DateTime', 'Image', 'Audio', 'Video', 'Binary', 'Blob', 'Boolean', 'GUID'];

  const appendMethods = function (def) {
    if (def.methods) {
      const defMethodNames = def.methods.map(meth => meth.name);
      const filteredMethods = methodsToAdd.filter(meth => !defMethodNames.find(name => name === meth.name));
      return def.methods.concat(filteredMethods);
    }
    else {
      return methodsToAdd;
    }
  }

  let resultMetadata = { ...metadata };
  resultMetadata.definitions = metadata.definitions.map(def => {
    if (!searchTypes.find(typeName => typeName === def.name)) {
      return def;
    }

    let resultDef = { ...def };
    resultDef.methods = appendMethods(def);
    return resultDef;
  });
  return resultMetadata;
}


//Checks that there aren't members in options that are not in the metadata
 function validate1(options,rawMetadata){
  let validate = []

  let methodsMetadata = []
  
      for(let cat in rawMetadata.definitions){
        for(let met in rawMetadata.definitions[cat].methods){
          methodsMetadata.push(rawMetadata.definitions[cat].methods[met].name)
        } 
      }
 
      if (options.implemented) {
        for (let entryKey in options.implemented) {
        
          let members = options.implemented[entryKey].members;
        
          if (members) {

          for (let memberKey in members){
          
          if(members[memberKey].path){
            if(methodsMetadata.find(element => element === memberKey) === undefined){
              validate.push({"method":memberKey, "entryKey": entryKey})
            }
          }
          }
          }

        }
      }
      return validate
  }

  //Has the same name, hasn't got an alias nor the same path
  function validate2(options){
    let validate = []

    if (options.implemented) {
      let aux = []
      let aux2 = []
      for (let entryKey in options.implemented) {
  
        let members = options.implemented[entryKey].members;
    
        if (members) {

        for (let memberKey in members){
          let index = aux.findIndex(element => element.name === members[memberKey].name)
          if(index === -1){
              aux.push({"path":members[memberKey].path, "name":members[memberKey].name})

          }else{

              if(members[memberKey].path && members[memberKey].name){

                if(!members[memberKey].alias){
                  aux2.push(aux[index])
                  if(aux2.findIndex(element => element.path === members[memberKey].path) === -1){
                    validate.push({"entryKey":entryKey,"name":members[memberKey].name,"path":members[memberKey].path})
                  }
                }
              }
          }
        }
      }
    }
    }
    return validate
  }
  

function getInfoForIndex(options){
  
  if (options.implemented) {
      let aux = []

      for (let entryKey in options.implemented) {

        let members = options.implemented[entryKey].members;
        let pathGeneral = options.implemented[entryKey].path
        
        //***without members****//
        if(pathGeneral){
          if(aux.findIndex(aux => aux.path === pathGeneral) === -1){
            
            pathGeneral = pathGeneral.replace("@genexus/web-standard-functions", ".")
            aux.push({
              "path": pathGeneral,
              "name": entryKey,
              "alias": null,
              "class": true
            })
          }
        }
        //***********//
      
        //****with members****//
        if (members) {
          for (let memberKey in members) { 
            
            if(members[memberKey].path !== undefined && members[memberKey].name !==undefined){
              
              let path = members[memberKey].path
              path = path.replace("@genexus/web-standard-functions", ".")

              if(aux.findIndex(aux => aux.path === path) === -1 && !members[memberKey].notifiesGenerator){
                
                if(members[memberKey].alias){
                      aux.push({
                        "path": path,
                        "name": members[memberKey].name,
                        "alias": members[memberKey].alias,
                        "class": false
                      })
                }else{
                      aux.push({
                        "path": path,
                        "name": members[memberKey].name,
                        "alias": null,
                        "class": false
                      })
                }
              }

              //****NOTIFIES GENERATOR TRUE****//
              if(members[memberKey].notifiesGenerator && aux.findIndex(aux => aux.name === members[memberKey].name) === -1){
               
                if(members[memberKey].alias){
                  aux.push({
                    "path": path,
                    "name": members[memberKey].name,
                    "alias": members[memberKey].alias,
                    "class": false
                  })
              }else{
                  aux.push({
                    "path": path,
                    "name": members[memberKey].name,
                    "alias": null,
                    "class": false
                  })
              }

              }
            //*******************************//

            } 
            
              //****define but not implemented****//
              if(aux.findIndex(aux => aux.name === entryKey) === -1){
              if(!members[memberKey].path && !pathGeneral && members[memberKey].name){

                aux.push({
                  "path": './dist/lib-esm/generator/out/not_implemented',
                  "name": entryKey,
                  "alias": null,
                  "class": true
                })
              }
              } 
              //*******************//
            }
        }
      }
      return aux;
  } 
}





module.exports = {
  preprocessForTypescriptAPI: preprocessForTypescriptAPI,
  preprocessForAngularMetadata: preprocessForAngularMetadata,
  mergeOverloadedMethods: mergeOverloadedMethods,
  transformAttributeAndVariableMethods: transformAttributeAndVariableMethods,
  getInfoForIndex: getInfoForIndex,
  validate1: validate1,
  validate2: validate2
  };
