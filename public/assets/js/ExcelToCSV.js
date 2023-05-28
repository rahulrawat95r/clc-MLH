// Load the XLSX library
const XLSX = require("xlsx");

function converter(a) {
  // Read the Excel file
  const workbook = XLSX.readFile(a);

  // Get the first worksheet
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  // Convert the worksheet data to JSON format
  const data = XLSX.utils.sheet_to_json(worksheet);

  // Returns the data
  return data;
}

function excelSerialDateToJSDate(serialDate) {
  const SECONDS_IN_DAY = 86400;
  const EPOCH_DIFFERENCE = 25569; // Number of days between 1/1/1900 and 1/1/1970

  const utcDays = serialDate - EPOCH_DIFFERENCE;
  const utcValue = utcDays * SECONDS_IN_DAY;
  const date = new Date(utcValue * 1000);

  return date;
}

module.exports = {
  converter: converter,
  datechanger: excelSerialDateToJSDate,
};
