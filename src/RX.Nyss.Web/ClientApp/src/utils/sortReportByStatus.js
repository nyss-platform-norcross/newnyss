const sortOrder = ['Pending', 'New', 'Accepted', 'Rejected', 'Closed'];

export const sortByReportStatus = (a, b) => {
  const statusA = a.status;
  const statusB = b.status;

  const timeA = new Date(a.receivedAt).getTime();
  const timeB = new Date(b.receivedAt).getTime();

  // If statuses are different, compare based on sortOrder
  if (statusA !== statusB) {
    return sortOrder.indexOf(statusA) - sortOrder.indexOf(statusB);
  }

  // If statuses are the same, compare based on time
  return timeA - timeB;
}