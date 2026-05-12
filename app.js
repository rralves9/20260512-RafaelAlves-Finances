<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Finance Tracker</title>
    <link rel="manifest" href="manifest.json">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Finance Tracker</h1>
        <div id="status" class="status online">Online</div>
        
        <form id="financeForm">
            <input type="number" id="amount" placeholder="Amount ($)" step="0.01" required>
            <select id="category">
                <option value="Groceries">Groceries</option>
                <option value="Dining">Dining</option>
                <option value="Home">Home Improvement</option>
                <option value="Travel">Travel</option>
            </select>
            <input type="text" id="note" placeholder="Note (e.g. Ribeye)">
            <button type="submit">Save Transaction</button>
        </form>

        <h3>Pending Sync</h3>
        <ul id="queueList"></ul>
    </div>
    <script src="app.js"></script>
</body>
</html>

