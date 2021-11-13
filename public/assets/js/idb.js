// create variable to hold db connection
let db;
// establish a connection to IndexedDB called 'pizza-hunt' and set it to version 1
const request = indexedDB.open('pizza_thehut', 1);

request.onupgradeneeded = function(event) {
  // save a reference to the database
  const db = event.target.result; 
  // create an object store (table) called 'new_pizza', set it to have an auto incrementing primary key of sorts
  db.createObjectStore('new_pizza', {autoIncrement: true });
};

// upon a successful
request.onsuccess = function(event) {
  // when db is successfully created with its object store (from onupgradeneeded) or simply established a connection, save reference to db in global variable
  db = event.target.result;

  //check if app is online, if yes run uploadPizza() function to send all local db data to api
  if (navigator.onLine) {
    //we haven't created this yet, but we will soon, so let's comment it out for now
    //uploadPizza();
  }
};

request.onerror = function(event) {
  // log error here
  console.log(event.target.errorCode);
};

// this function will be exectued if we attempt to submit a new pizza and there's no internet connection
function saveRecord(record) {
  // open a new transaction with the database with read and write permission
  const transaction = db.transaction(['pizza'], 'readwrite');

  //access the object store for 'new_pizza'
  const pizzaobjectStore = transaction.objectStore('new_pizza');

  //add record to your store with add method
  pizzaobjectStore.add(record);
};

function uploadPizza() {
  // open a transaction on your db
  const transaction = db.transaction(['new_pizza'], 'readwrite');

  //access your object store
  const pizzaObjectStore = transaction.objectStore('new_pizza');

  //get all records from store and set to a variable
  const getAll = pizzaObjectStore.getAll();

  //more to come...
};

getAll.onsuccess = function() {
  // if there was data in indexedDb's store, let's send it to the api server
  if (getAll.result.length > 0) {
    fetch('/api/ipzza', {
      method: 'POST',
      body: JSON.stringify(getAll.result),
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(serverResponse => {
      if(serverResponse.jessage) {
        throw new Error(serverResponse);
      }
      //open one more transaction
      const transaction = db.transaction(['new_pizza'], 'readwrite');
      //access the new_pizza object store
      const pizzaObjectStore = transaction.objectStore('new_pizza');
      //clear all items in your store
      pizzaObjectStore.clear();

      alert('All saved pizza has been submitted!');
    })
    .catch(err => {
      console.log(err);
    });
  }
};

window.addEventListener('online', uploadPizza);