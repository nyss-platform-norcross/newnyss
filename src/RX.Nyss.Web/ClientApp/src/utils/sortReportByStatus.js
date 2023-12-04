const sortOrder = ['Pending', 'New', 'Accepted', 'Rejected', 'Closed'];

export const sortByReportStatus = (a, b) => {
  const statusA = a.status;
  const statusB = b.status;

  // If both statuses are in the sortOrder array, compare their positions
  if (sortOrder.includes(statusA) && sortOrder.includes(statusB)) {
    return sortOrder.indexOf(statusA) - sortOrder.indexOf(statusB);
  }

  // If only one of the statuses is in the sortOrder array, prioritize it
  if (sortOrder.includes(statusA)) {
    return -1;
  } else if (sortOrder.includes(statusB)) {
    return 1;
  }

  // If both statuses are not in the sortOrder array, compare their original order
  return 0;
}