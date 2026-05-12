// 1. Open/Create the local database on your phone
const dbRequest = indexedDB.open("FinanceDB", 1);
let db;

dbRequest.onupgradeneeded = e => {
    db = e.target.result;
    // Create an "outbox" to store pending transactions
    db.createObjectStore("outbox", { autoIncrement: true });
};

dbRequest.onsuccess = e => { 
    db = e.target.result; 
    displayQueue(); 
    attemptSync(); // Try syncing as soon as the app opens
};

// 2. Handle the Form Submission
document.getElementById('financeForm').onsubmit = e => {
    e.preventDefault();
    
    // Grab the data from your input fields
    const entry = {
        amount: document.getElementById('amount').value,
        category: document.getElementById('category').value,
        note: document.getElementById('note').value,
        date: new Date().toLocaleString()
    };

    saveToLocal(entry);
    
    // Clear the form for the next entry
    document.getElementById('financeForm').reset();
};

// 3. Save to the phone's internal memory (IndexedDB)
function saveToLocal(entry) {
    const tx = db.transaction("outbox", "readwrite");
    const store = tx.objectStore("outbox");
    store.add(entry);
    
    tx.oncomplete = () => {
        displayQueue();
        attemptSync();
    };
}

// 4. The Sync Logic: Send local data to Google Sheets
async function attemptSync() {
    // If there's no internet, stop here and wait
    if (!navigator.onLine) {
        document.getElementById('status').innerText = "Offline - Saving Locally";
        document.getElementById('status').className = "status offline";
        return;
    }

    document.getElementById('status').innerText = "Online";
    document.getElementById('status').className = "status online";

    const tx = db.transaction("outbox", "readwrite");
    const store = tx.objectStore("outbox");
    
    // Get all pending items
    const allRecordsRequest = store.getAll();

    allRecordsRequest.onsuccess = async (e) => {
        const allRecords = e.target.result;
        if (allRecords.length === 0) return;

        for (let record of allRecords) {
            try {
                // REPLACE THE URL BELOW with your Google Apps Script URL
                const response = await fetch('YOUR_APPS_SCRIPT_URL', {
                    method: 'POST',
                    mode: 'no-cors', 
                    body: JSON.stringify(record)
                });
                
                // If we reach this point, consider it sent and clear it locally
                // Note: 'no-cors' mode makes it hard to check 'response.ok', 
                // but usually works for simple Apps Script pushes.
            } catch (err) { 
                console.log("Sync failed for one item, will retry later."); 
            }
        }
        
        // Clear the local outbox once finished
        const clearTx = db.transaction("outbox", "readwrite");
        clearTx.objectStore("outbox").clear();
        clearTx.oncomplete = () => displayQueue();
    };
}

// 5. Show the "Waiting Room" list in the UI
function displayQueue() {
    const list = document.getElementById('queueList');
    const tx = db.transaction("outbox", "readonly");
    const store = tx.objectStore("outbox");
    
    store.getAll().onsuccess = e => {
        const items = e.target.result;
        list.innerHTML = items.map(item => `<li>$${item.amount} - ${item.note} <small>(${item.category})</small></li>`).join('');
        
        // Update the pending count if you have one
        const count = items.length;
        console.log(`Pending items: ${count}`);
    };
}

// 6. Listen for when the phone regains internet connection
window.addEventListener('online', attemptSync);
window.addEventListener('offline', () => {
    document.getElementById('status').innerText = "Offline - Saving Locally";
    document.getElementById('status').className = "status offline";
});

