exports.parseDateString = (dateString) => {
  const parts = dateString.split('-');

  if (parts.length !== 3) {
    throw new Error("Invalid date format. Use DD-MM-YYYY or YYYY-MM-DD.");
  }

  const [first, second, third] = parts.map(Number);

  // Check format: YYYY-MM-DD or DD-MM-YYYY
  if (first > 31) {
    // Assume it's YYYY-MM-DD
    return new Date(first, second, third); // Month is now 1-indexed
  } else {
    // Assume it's DD-MM-YYYY
    return new Date(third, second, first); // Month is now 1-indexed
  }
}

exports.parseDateString2 = (dateString) => {
  const parts = dateString.split('-');

  if (parts.length !== 3) {
      throw new Error("Invalid date format. Use DD-MM-YYYY or YYYY-MM-DD.");
  }

  const [first, second, third] = parts.map(Number);

  let date;
  // Check format: YYYY-MM-DD or DD-MM-YYYY
  if (first > 31) {
      // Assume it's YYYY-MM-DD
      date = new Date(first, second - 1, third); // Month is 0-indexed
  } else {
      // Assume it's DD-MM-YYYY
      date = new Date(third, second - 1, first); // Month is 0-indexed
  }

  // Format date to DD-MM-YYYY
  const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  return formattedDate;
};
