let db;
const request = indexedDB.open('budget', 1);
// cited from : https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  db.createObjectStore('pending', { autoIncrement: true });
};

request.onsuccess = (event) => {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = (event) => {
  console.log('Something went wrong!' + event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(['pending'], 'readwrite');
  const store = transaction.objectStore('pending');

  store.add(record);
}

checkDatabase = () => {
  const transaction = db.transaction(['pending'], 'readwrite');
  const store = transaction.objectStore('pending');
  const getAll = store.getAll();
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(() => {
          // this is where we clear the store after success
          const transaction = db.transaction(['pending'], 'readwrite');
          const store = transaction.objectStore('pending');
          store.clear();
        });
    }
  };
};

window.addEventListener('online', checkDatabase);
