let prizeList = [];
let selectedPrize = null;

// Load prize.json
async function loadPrizeJson() {
    const res = await fetch("../json/gift.json");
    return await res.json();
}

// Hiển thị dropdown giải
async function initPrizeSelect() {
    prizeList = await loadPrizeJson();
    const select = document.getElementById("prizeSelect");

    prizeList.forEach((p) => {
        let opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${p.name} (slot ${p.slot})`;
        select.appendChild(opt);
    });
}
async function initializeUsers() {
    const db = await openDB();
    const count = await checkUserCount(db);
    if (count > 0) {
        console.log("DB đã có dữ liệu, không import từ JSON");
        return;
    }
    console.log("DB chưa có dữ liệu → Đọc user.json...");
    const users = await loadUserJson();
    await saveUsersToDB(db, users);
    console.log("Đã import JSON vào IndexedDB thành công!");
}
window.onload = function () {
    initializeUsers();
    initPrizeSelect();
};