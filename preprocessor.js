"use strict";

function preprocess(metadata, options) {
  /**
   * Removes already implemented elements (options["implemented"])
   * Removes ignored elements (options["ignored"])
   * Merges overloaded methods into one with optional parameters
   * Renames methods that require disambiguation (options["disambiguated"])
   */
  if (!metadata.definitions) {
    return metadata;
  }

  metadata = removeImplementedAndIgnored(metadata, options);
  metadata = addGenerateClassInformation(metadata);
  metadata = mergeOverloadedMethods(metadata);
  metadata = disambiguateElements(metadata, options);

  return metadata;
}

function removeImplementedAndIgnored(metadata, options) {
  const implemented = getImplemented(options);
  const ignored = getIgnored(options);
  const doNotGenerate = implemented.concat(ignored);

  metadata["definitions"] = metadata.definitions.reduce((reducedDef, def) => {
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

      if (def.methods) {
        def.methods = def.methods.reduce(filterItems, []);
      }
      if (def.properties) {
        def.properties = def.properties.reduce(filterItems, []);
      }

      reducedDef.push(def);
      return reducedDef;
    }
  }, []);
  return metadata;
}

function addGenerateClassInformation(metadata) {
  metadata["definitions"] = metadata.definitions.map((def) => {
    def["generateClass"] = shouldGenerateClass(def);
    return def;
  });
  return metadata;
}

function mergeOverloadedMethods(metadata) {
  metadata["definitions"] = metadata.definitions.map((def) => {
    if (def.methods) {
      const mergeOverloads = function (currentMethods, method) {
        let existing = currentMethods.find((current) => { return current.name == method.name && current.static == method.static });
        if (existing) {
          let params = mergeMethodParameters(existing.parameters, method.parameters);
          existing.parameters = params;
        }
        else {
          currentMethods.push(method);
        }
        return currentMethods;
      }

      def.methods = def.methods.reduce(mergeOverloads, []);
    }
    return def;
  });
  return metadata;
}

function mergeMethodParameters(params1, params2) {
  const makeParameterOptional = function (p) {
    p["optional"] = true;
    return p;
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
      result = result.concat(pars.slice(commonCount).map(makeParameterOptional));
    }
  };

  appendExtraParams(params1);
  appendExtraParams(params2);

  return result;
}

function mergedParameter(par1, par2) {
  let result = {};
  result["name"] = par1.name;
  result["type"] = mergeParameterType(par1.type, par2.type);
  result["description"] = par1.description;
  result["accesstype"] = mergeAccessType(par1.accessType, par2.accessType);
  result["optional"] = boolFromValue(par1.optional) || boolFromValue(par2.optional);
  return result;
}

function boolFromValue(val) {
  if (val == true) { return true; } else { return false; }
}

function mergeAccessType(at1, at2) {
  if (!at1 && !at2) { return "in"; }
  else if (!at1) { return at2; }
  else if (!at2) { return at1; }
  else {
    if (at1 == at2) {
      return at1;
    }
    else {
      // either one of them is "inout" and the other is "in" or "out", or one is "in" and the other is "out"
      // anyhow =>
      return "inout";
    }
  }
}

function mergeParameterType(t1, t2) {
  if (!t1 && !t2) { return "" }
  else if (!t1) { return t2 }
  else if (!t2) { return t1 }
  else if (t1 == t2) { return t1 }
  else { return "any" }
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

function getIgnored(options) {
  let ignored = [];
  if (options.ignored) {
    for (let entryKey in options.ignored) {
      ignored = ignored.concat(options.ignored[entryKey].map(item => memberName(entryKey, item)));
    }
  }
  return ignored;
}

function memberName(entry, member) {
  if (member) {
    return `${entry}::${member}`;
  } else {
    return entry;
  }
}

function shouldGenerateClass(def) {
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
    return metadata
  }

  console.log(disambiguations);

  metadata.definitions = metadata.definitions.map((def) => {
    let entryName = def.name;
    const disambiguateItem = function (item) {
      let disambiguationName = memberName(entryName, item.name);
      if (disambiguations[disambiguationName]) {
        item.name = disambiguations[disambiguationName];
      }
      return item;
    };

    if (def.methods) {
      def.methods = def.methods.map(disambiguateItem);
    }

    return def;
  });
  return metadata;
}

function getDisambiguated(options) {
  if (!options["disambiguated"]) {
    return null
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

module.exports = {
  preprocess: preprocess,
  mergeOverloadedMethods: mergeOverloadedMethods
};
