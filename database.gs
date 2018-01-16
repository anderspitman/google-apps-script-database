
function Database(options) {
  
  this._tables = {};
  this._spreadsheet = options.spreadsheet;
}

Database.fromSpreadsheet = function(spreadsheet) {

  return new Database({
    spreadsheet: spreadsheet
  });
};

Database.prototype.getTable = function(tableName) {
  
  if (!this._tables[tableName]) {
      
    this._tables[tableName] = new Table({
      sheet: this._spreadsheet.getSheetByName(tableName)
    });
    
    if (!this._tables[tableName]) {
      throw "Table " + tableName + " does not exist in " + this._spreadsheet.getName();
    }
  }
  
  return this._tables[tableName];
};

function Table(options) {

  this._sheet = options.sheet;
  
  this._table = parseSheetAsTable(this._sheet);
}

Table.fromSheet = function(sheet) {

  return new Table({
    sheet: sheet
  });
};

Table.prototype.getColumnNames = function() {

  return this._table.headers;
};

Table.prototype.find = function(query) {

  // if no query provided, return all rows (as a copy)
  if (!query) {
    return this._table.rows.slice();
  }
  
  var results = [];
  this._table.rows.forEach(function(row) {
  
    var matches = true;
    var keys = Object.keys(query);
    for (var i = 0; i < keys.length; i++) {
    
      var key = keys[i];
      
      // if a filtering function was provided use that to determine a match
      if (typeof query[key] === 'function') {
      
        if (!query[key](row[key])) {
          matches = false;
          break;
        }
      }
      else {
    
        if (query[key] !== row[key]) {
          matches = false;
          break;
        }
      }
    }
    
    if (matches) {
      results.push(row);
    }
  }, this);
  
  return results;
};

Table.prototype.findOne = function(query) {

  //this._table.rows.forEach(function(row) {
  for (var j = 0; j < this._table.rows.length; j++) {
  
    var row = this._table.rows[j];
  
    var matches = true;
    var keys = Object.keys(query);
    for (var i = 0; i < keys.length; i++) {
    
      var key = keys[i];
      
      // if a filtering function was provided use that to determine a match
      if (typeof query[key] === 'function') {
      
        if (!query[key](row[key])) {
          matches = false;
          break;
        }
      }
      else {
    
        if (query[key] !== row[key]) {
          matches = false;
          break;
        }
      }
    }
    
    if (matches) {
      return row;
    }
  }
  
  return null;
};


Table.prototype.indexBy = function(column) {

  if (!arrayContains(this._table.headers, column)) {
    throw "Table does not contain column header " + column;
  }
  
  var result = {};
  this._table.rows.forEach(function(record) {
    
    result[record[column]] = record;
  }, this);
  
  return result;
};

Table.prototype.indexBy = function(column) {

  if (!arrayContains(this._table.headers, column)) {
    throw "Table does not contain column header " + column;
  }
  
  var result = {};
  this._table.rows.forEach(function(record) {
  
    if (result[record[column]] === undefined) {
      result[record[column]] = [];
    }
    
    result[record[column]].push(record);
  }, this);
  
  return result;
};
