
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("FERewardDB", 2);

        request.onupgradeneeded = function (e) {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("UsersNoel")) {
                const store = db.createObjectStore("UsersNoel", {
                    keyPath: "UserCode",
                });
            }
        };


        request.onsuccess = function (e) {
            resolve(e.target.result);
        };

        request.onerror = function () {
            reject("Không thể mở DB");
        };
    });
}
function getUsersFromDB() {
    return new Promise(async (resolve) => {
        const db = await openDB(); // Hàm openDB từ trước
        const tx = db.transaction("UsersNoel", "readonly");
        const store = tx.objectStore("UsersNoel");

        const users = [];
        store.openCursor().onsuccess = function (e) {
            const cursor = e.target.result;
            if (cursor) {
                users.push(cursor.value);
                cursor.continue();
            } else {
                resolve(users);
            }
        };
    });
}
///// update User
function updateUserInDB(user) {
    return new Promise(async (resolve) => {
        const db = await openDB();
        const tx = db.transaction("UsersNoel", "readwrite");
        const store = tx.objectStore("UsersNoel");
        store.put(user);
        tx.oncomplete = () => resolve(true);
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

function checkUserCount(db) {
    return new Promise((resolve) => {
        const tx = db.transaction("UsersNoel", "readonly");
        const store = tx.objectStore("UsersNoel");
        const req = store.count();

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(0);
    });
}
async function loadUserJson() {
    console.log(usernoel, 'usernoel');
    // const res = await fetch("../json/usernoel.json");
    return usernoel;
}
function saveUsersToDB(db, users) {
    return new Promise((resolve) => {
        const tx = db.transaction("UsersNoel", "readwrite");
        const store = tx.objectStore("UsersNoel");

        users.forEach((user) => store.put(user));

        tx.oncomplete = () => resolve(true);
    });
}

async function quaySo() {
    const btn = document.querySelector('.spin-btn');
    const slots = document.querySelectorAll('.slot');
    btn.disabled = true;
    btn.innerText = "ĐANG QUAY...";
    const users = await getUsersFromDB();
    let availableUsers = users.filter((u) => u.IsReward == 0 && u.isJoin == 1);
    console.log("availableUsers: ", availableUsers.length);
    if (availableUsers.length <= 0) {
        alert("Không đủ người để quay!");
        return;
    }
    const idx = Math.floor(Math.random() * availableUsers.length);
    const winners = [];
    winners.push(availableUsers[idx]);
    const ketQua = availableUsers[idx].UserCode;
    console.log("Kết quả sẽ về: " + ketQua);

    const intervals = [];

    slots.forEach((slot, index) => {
        slot.style.transform = "translateY(-5px)";
        slot.style.transition = "transform 0.1s";

        intervals[index] = setInterval(() => {
            slot.innerText = Math.floor(Math.random() * 10);
        }, 80);
    });

    // 4. Dừng số theo hiệu ứng thác nước (Waterfall)
    slots.forEach((slot, index) => {
        // Ô đầu tiên dừng sau 2s, các ô sau trễ thêm 0.5s mỗi ô
        const thoiGianDung = 2000 + (index * 500);

        setTimeout(() => {
            clearInterval(intervals[index]); // Dừng chạy ngẫu nhiên
            slot.innerText = ketQua[index]; // Gán số kết quả
            slot.style.transform = "scale(1.3)";
            slot.style.borderColor = "#2e7d32"; // Đổi viền sang xanh lá
            slot.style.color = "#2e7d32";

            setTimeout(() => {
                slot.style.transform = "scale(1)";
            }, 200);

            // Nếu là ô cuối cùng thì mở lại nút
            if (index === 5) {
                btn.disabled = false;
                btn.innerText = "QUAY TIẾP";
                setTimeout(() => showWinner(winners[0]), 500);
            }

        }, thoiGianDung);
    });

    // Cập nhật trạng thái trúng
    // winners.forEach(async w => {
    //     w.IsReward = 1;
    //     await updateUserInDB(w);
    // });
}


document.addEventListener('keydown', (e) => {
    const intro = document.getElementById('intro-screen');
    const boxes = document.querySelectorAll('.slot-box');

    // Nhấn Space để ẩn intro
    if (e.code === 'Space' && !intro.classList.contains('hidden')) {
        intro.classList.add('hidden');
    }

    // Nhấn Enter để quay số
    if (e.code === 'Enter' && intro.classList.contains('hidden')) {
        quaySo();
    }
});
initializeUsers();



// Dialog

async function showWinner(user) {
    const dialog = document.getElementById('winner-dialog');
    const nameEl = document.getElementById('winner-name');
    const codeEl = document.getElementById('winner-code');

    try {
        if (user.UserCode != "") {
            const luckyPerson = user;
            nameEl.textContent = luckyPerson.UserName || "Vô Danh";
            codeEl.textContent = "Mã số: " + luckyPerson.UserCode;
            dialog.style.display = 'flex';
        } else {
            alert("Database trống, không có người để trúng giải!");
        }
    } catch (err) {
        console.error("Lỗi lấy người trúng giải:", err);
    }
}

// Cập nhật sự kiện đóng Dialog
document.getElementById('close-dialog').addEventListener('click', () => {
    document.getElementById('winner-dialog').style.display = 'none';
});