/**
 * Utils Module
 * @NApiVersion 2.x
 * @NModuleScope Public
 * @author trungpv <trung@lexor.com>
 */
define([], function() {
  /**
   * converts array-like object to array
   * @param {*} collection
   */
  function arrayify(collection) {
    return Array.prototype.slice.call(collection);
  }

  /**
   * generates factory functions to convert table rows to objects,
   * based on the titles in the table's <thead>
   * @param {*} headings
   */
  function factory(headings) {
    return function(row) {
      return arrayify(row.cells).reduce(function(prev, curr, i) {
        prev[headings[i]] = curr.innerText;
        return prev;
      }, {});
    };
  }

  /**
   * generates factory functions to convert table rows to objects,
   * based on the titles in the table's <thead>
   * @param {*} headings
   */
  function factoryMapAttr(headings, attributes) {
    return function(row) {
      return arrayify(row.cells).reduce(function(prev, curr, i) {
        var existsAttr = attributes.reduce(function(prevAttr, currAttr) {
          if (curr.hasAttribute(currAttr)) {
            return currAttr;
          }

          if (curr.hasAttribute(prevAttr)) {
            return prevAttr;
          }
          return false;
        });
        if (curr.querySelector("select")) {
          prev[headings[i]] = curr.querySelector("select").value;
        } else {
          prev[headings[i]] = existsAttr
            ? curr.getAttribute(existsAttr)
            : curr.innerText;
        }
        return prev;
      }, {});
    };
  }

  /**
   * given a table, generate an array of objects.
   * each object corresponds to a row in the table.
   * each object's key/value pairs correspond to a column's heading and the row's value for that column
   * @param {*} table
   */
  function parseTable(table) {
    var headings = arrayify(table.tHead.rows[0].cells).map(function(heading) {
      return heading.innerText;
    });
    return arrayify(table.tBodies[0].rows).map(factory(headings));
  }

  /**
   * given a table, generate an array of objects.
   * each object corresponds to a row in the table.
   * each object's key/value pairs correspond to a column's heading and the row's value for that column
   * @param {*} table
   */
  function parseTable(table, attributes) {
    var headings = arrayify(table.tHead.rows[0].cells).map(function(heading) {
      return heading.innerText.replace(/\s/gi, "_").toUpperCase();
    });
    return arrayify(table.tBodies[0].rows).map(
      factoryMapAttr(headings, attributes)
    );
  }

  return {
    parseTable: parseTable
  };
});
