function preprocess(metadata, options) {
  /**
   * Removes already implemented elements (options["implemented"])
   * Removes ignored elements (options["ignored"])
   * TODO: Merges overloaded methods into one with optional parameters
   * TODO: Renames methods that require disambiguation (options["disambiguated"])
   */
  const implemented = getImplemented(options);
  const ignored = getIgnored(options);
  const doNotGenerate = implemented.concat(ignored);
  
  metadata["definitions"] = metadata.definitions.reduce((reducedDef, def) => {
    const entryName = def.name;
    if (doNotGenerate.includes(entryName)) {
      return reducedDef;
    } else {
      const filterItems = function(result, item) {
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

      def["generateClass"] = shouldGenerateClass(def);

      reducedDef.push(def);
      return reducedDef;
    }
  }, []);
  return metadata;
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
      ignored = ignored.concat( options.ignored[entryKey].map( item => memberName(entryKey, item)) );
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
      return result || method.static;
    }, false);
  }
  if (!genClass && def.properties) {
    genClass = def.properties.length > 0;
  }
  return genClass;
}

module.exports = preprocess;