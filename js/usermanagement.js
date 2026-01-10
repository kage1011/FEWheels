let jsonData = [];
let jsonPrize = [];
let jsonUserData = [];
let jsonUserAllData = [];

function startSmartAutoFocus() {
  setInterval(() => {
    const quickInput = document.getElementById("quickInput");
    const userModal = document.getElementById("userModal");

    let isModalOpen = false;
    if (userModal) {
      const style = window.getComputedStyle(userModal);
      if (
        userModal.classList.contains("show") ||
        style.display === "flex" ||
        style.display !== "none"
      ) {
        isModalOpen = true;
      }
    }

    const activeEl = document.activeElement;
    const isUserTypingElsewhere =
      activeEl &&
      (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA") &&
      activeEl !== quickInput;

    if (quickInput && !isModalOpen && !isUserTypingElsewhere) {
      if (document.activeElement !== quickInput) {
        quickInput.focus();
      }
    }
  }, 1000);
}

startSmartAutoFocus();

// --- KHỞI CHẠY ---
document.addEventListener("DOMContentLoaded", async () => {
  initializeUsers();
  const users = await loadUsers();
  const prizes = await loadPrizes();
  jsonPrize = prizes;
  jsonUserAllData = users;
  jsonUserData = users.filter((u) => u.isJoin == 1);
  jsonData = mapUserWithPrize(jsonUserData, jsonPrize);
  renderHeader();
  renderTable(jsonData);
});
function mapUserWithPrize(users, prizes) {
  return users.map((user, index) => {
    const prize = prizes.find((p) => p.id == user.IsReward);
    return {
      ...user,
      prizeName: prize ? prize.name : "",
      number: index + 1,
    };
  });
}

const COLUMN_HEADERS = [
  "Số thứ tự",
  "Mã NV",
  "Tên NV",
  "Bộ phận",
  "Tổ",
  "Thắng giải",
  "Ảnh",
  "",
];

// Hàm khởi tạo Load User
async function loadUser() {
  try {
    const users = await loadUsers();
    const prizes = await loadPrizes();
    jsonPrize = prizes;
    jsonUserAllData = users;
    jsonUserData = users.filter((u) => u.isJoin == 1);
    jsonData = mapUserWithPrize(jsonUserData, jsonPrize);
    renderTable(jsonData);
  } catch (err) {
    return [];
  }
}
async function loadUsers() {
  try {
    const users = await getUsersFromDB();
    return users;
  } catch (err) {
    return [];
  }
}
async function loadPrizes() {
  try {
    return prizesFENV;
  } catch (err) {
    console.error(err);
    return [];
  }
}
function updateUserInDB(user) {
  return new Promise(async (resolve) => {
    const db = await openDB();
    const tx = db.transaction("Users", "readwrite");
    const store = tx.objectStore("Users");
    store.put(user);
    tx.oncomplete = () => resolve(true);
  });
}

// --- 2. RENDER TABLE ---

function renderHeader() {
  const tr = document.getElementById("tableHeaderRow");
  tr.innerHTML = "";
  COLUMN_HEADERS.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;
    tr.appendChild(th);
  });
}

function renderTable(data) {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  data.forEach((item) => {
    // Nếu đã "Xoá mềm" (IsJoin = 0) thì có thể làm mờ hoặc ẩn (tuỳ logic, ở đây mình làm mờ)
    // Lưu ý: Đề bài yêu cầu xoá là IsJoin=0, thêm nhanh là IsJoin=1.
    // Nên hiển thị tất cả để quản lý.

    const tr = document.createElement("tr");
    if (item.isJoin === 0) {
      // tr.classList.add("status-inactive"); // Bật dòng này nếu muốn làm mờ user đã xoá
    }

    // Tạo mảng dữ liệu cho các cột như yêu cầu
    let cols = [
      item.number,
      item.UserCode,
      item.UserName,
      item.Department,
      item.Team,
      item.prizeName,
      `<img src="../assets/users/${item.UserCode}.JPG" class="user-img">`, // Fallback ảnh lỗi
      // Cột hành động
      `
            <button class="btn-icon btn-edit" onclick="openModal('edit', '${item.UserCode}')" title="Sửa">✎</i></button>
            <button class="btn-icon btn-delete" onclick="softDeleteUser('${item.UserCode}')" title="Xoá">🚫</i></button>
            `,
    ];

    cols.forEach((colData, index) => {
      const td = document.createElement("td");
      // Nếu là cột Hình ảnh hoặc Hành động thì dùng innerHTML, còn lại textContent để bảo mật
      if (index === 6 || index === 7) {
        td.innerHTML = colData;
      } else {
        td.textContent = colData || "";
      }
      if (index === 8) {
        td.style = "display: grid; ";
      }
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

// --- 3. CHỨC NĂNG NGHIỆP VỤ ---

// Xử lý Input nhập nhanh (Check-in)
async function handleQuickInput() {
  const input = document.getElementById("quickInput");
  const cardVal = input.value.trim();
  if (!cardVal) return;
  let user = {};
  if (cardVal.length == 6) {
    user = jsonUserAllData.find((u) => u.UserCode == cardVal);
  } else {
    user = jsonUserAllData.find((u) => u.AttendanceCard == cardVal);
  }

  if (user) {
    if (user.isJoin == 1) {
      alert(`User ${user.UserName} đã được thêm rồi!`);
    } else {
      // Update trạng thái
      user.isJoin = 1;
      await updateUserInDB(user);
      loadUser(); // Reload lại bảng
      const msg = document.getElementById("statusMessage");
      msg.textContent = `Đã cập nhật: ${user.UserName}`;
      msg.style.color = "green";
      setTimeout(() => (msg.textContent = ""), 3000);
    }
  } else {
    alert("Không tìm thấy số thẻ này!");
  }
  input.value = ""; // Xoá ô nhập
  input.focus();
}

// Xử lý phím Enter cho ô nhập
document
  .getElementById("quickInput")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      handleQuickInput();
    }
  });

// Xoá mềm (Soft Delete -> isJoin = 0)
async function softDeleteUser(userCode) {
  if (!confirm("Bạn có chắc muốn xoá (ẩn) nhân viên này?")) return;

  const user = jsonUserData.find((u) => u.UserCode === userCode);
  if (user) {
    user.isJoin = 0;
    await updateUserInDB(user);
    loadUser();
  }
}

// --- 4. MODAL & FORM ---

const modal = document.getElementById("userModal");
const form = document.getElementById("userForm");
let currentMode = "add"; // 'add' hoặc 'edit'

function openModal(mode, userCode = null) {
  currentMode = mode;
  modal.style.display = "flex";

  if (mode === "add") {
    document.getElementById("modalTitle").textContent = "Thêm Nhân Viên";
    form.reset();
    document.getElementById("editId").value = "";
  } else {
    document.getElementById("modalTitle").textContent = "Sửa Nhân Viên";
    const user = jsonUserData.find((u) => u.UserCode === userCode);
    if (user) {
      // Fill dữ liệu vào form
      document.getElementById("inpAttendanceCard").value =
        user.AttendanceCard || "";
      document.getElementById("inpUserCode").value = user.UserCode || "";
      document.getElementById("inpUserName").value = user.UserName || "";
      document.getElementById("inpDepartment").value = user.Department || "";
      document.getElementById("inpSection").value = user.Section || "";
      document.getElementById("inpTeam").value = user.Team || "";
      document.getElementById("inpJobTitle").value = user.JobTitle || "";
      document.getElementById("inpPrizeName").value = user.prizeName || "";
      // Lưu ID cũ (UserCode) để biết đang sửa ai
      document.getElementById("editId").value = user.UserCode;
    }
  }
}

function closeModal() {
  modal.style.display = "none";
}

// Xử lý Submit Form (Thêm/Sửa)
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = {
    AttendanceCard: document.getElementById("inpAttendanceCard").value,
    UserCode: document.getElementById("inpUserCode").value,
    UserName: document.getElementById("inpUserName").value,
    Department: document.getElementById("inpDepartment").value,
    Section: document.getElementById("inpSection").value,
    Team: document.getElementById("inpTeam").value,
    JobTitle: document.getElementById("inpJobTitle").value,
    isJoin: "1",
    IsReward: "0",
    AttendanceDate: "",
  };

  if (currentMode === "add") {
    await updateUserInDB(formData);
  } else {
    const originalCode = document.getElementById("editId").value;
    let user = jsonUserAllData.find((u) => u.UserCode === originalCode);
    if (user) {
      Object.assign(user, formData);
      await updateUserInDB(user);
    }
  }

  closeModal();
  loadUser(); // Refresh bảng
});

// Đóng modal khi click ra ngoài
window.onclick = function (event) {
  if (event.target == modal) {
    closeModal();
  }
};

// DB

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("FERewardDB", 1);

    request.onupgradeneeded = function (e) {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("Users")) {
        const store = db.createObjectStore("Users", {
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
function saveUsersToDB(db, users) {
  return new Promise((resolve) => {
    const tx = db.transaction("Users", "readwrite");
    const store = tx.objectStore("Users");

    users.forEach((user) => store.put(user));

    tx.oncomplete = () => resolve(true);
  });
}

async function loadUserJson() {
  return user;
}

function checkUserCount(db) {
  return new Promise((resolve) => {
    const tx = db.transaction("Users", "readonly");
    const store = tx.objectStore("Users");
    const req = store.count();

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(0);
  });
}

///// get all User
async function getUsersFromDB() {
  // Trả về một Promise để có thể dùng await loadUser()
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();

      // Kiểm tra xem store có tồn tại không để tránh lỗi crash
      if (!db.objectStoreNames.contains("Users")) {
        console.warn("Store 'Users' không tồn tại!");
        return resolve([]);
      }

      const tx = db.transaction("Users", "readonly");
      const store = tx.objectStore("Users");
      const users = [];

      // Xử lý khi có lỗi trong quá trình đọc
      tx.onerror = (err) => reject("Lỗi Transaction: " + err.target.error);

      // Sử dụng cursor để lấy dữ liệu
      const request = store.openCursor();

      request.onsuccess = function (e) {
        const cursor = e.target.result;
        if (cursor) {
          // Bạn có thể lọc ngay tại đây để tăng hiệu năng
          // Ví dụ: chỉ đẩy vào mảng nếu IsJoin !== 0
          users.push(cursor.value);
          cursor.continue();
        } else {
          // Khi cursor kết thúc (e.target.result là null)
          resolve(users);
        }
      };

      request.onerror = (err) => reject("Lỗi Cursor: " + err.target.error);
    } catch (err) {
      console.error("Lỗi khởi tạo DB:", err);
      reject(err);
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const searchInputs = document.querySelectorAll(".column-search");

  searchInputs.forEach((input) => {
    input.addEventListener("keyup", function () {
      filterTable();
    });
  });
});

function filterTable() {
  // 1. Lấy bảng và các dòng dữ liệu
  const table = document.getElementById("userTable");
  const tr = table.getElementsByTagName("tr");

  // 2. Lấy giá trị của tất cả các ô input hiện tại
  const inputs = document.querySelectorAll(".column-search");
  let filters = {};

  inputs.forEach((input) => {
    const colIndex = input.getAttribute("data-col");
    const value = input.value.toLowerCase();
    if (value) {
      filters[colIndex] = value;
    }
  });
  for (let i = 2; i < tr.length; i++) {
    let row = tr[i];
    let tds = row.getElementsByTagName("td");
    let showRow = true;
    for (let colIndex in filters) {
      if (tds[colIndex]) {
        let txtValue = tds[colIndex].textContent || tds[colIndex].innerText;
        if (txtValue.toLowerCase().indexOf(filters[colIndex]) === -1) {
          showRow = false;
          break;
        }
      }
    }

    row.style.display = showRow ? "" : "none";
  }
}

function mapUserWithPrizeToExcel(users, prizes) {
  return users.map((user, index) => {
    const prize = prizes.find((p) => p.id == user.IsReward);
    return {
      ...user,
      prizeName: prize ? prize.name : "",
      number: index + 1,
    };
  });
}

const exportColumns = [
  { key: "number", header: "STT" },
  { key: "UserCode", header: "Mã NV" },
  { key: "UserName", header: "Tên NV" },
  { key: "Department", header: "Bộ phận" },
  { key: "Section", header: "Tổ" },
  { key: "prizeName", header: "Thắng giải" },
];

async function exportExcel() {
  let jsonDataEX = [];
  let jsonPrizeEX = [];
  let jsonUserDataEX = [];
  let jsonUserAllDataEX = [];

  const users = await loadUsers();
  const prizes = await loadPrizes();
  jsonPrizeEX = prizes;
  jsonUserAllDataEX = users;
  jsonUserDataEX = users
    .filter((u) => u.isJoin == 1)
    .sort((a, b) => new Date(a.AttendanceDate) - new Date(b.AttendanceDate));
  jsonDataEX = mapUserWithPrizeToExcel(jsonUserDataEX, jsonPrizeEX);
  // 1. Map dữ liệu theo cột cần export
  const exportData = jsonDataEX.map((row) => {
    const obj = {};
    exportColumns.forEach((col) => {
      obj[col.header] = row[col.key];
    });
    return obj;
  });

  // 2. Tạo worksheet
  const ws = XLSX.utils.json_to_sheet(exportData, {
    skipHeader: false,
  });

  // 3. Thêm header + style
  exportColumns.forEach((col, index) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
    ws[cellAddress] = {
      v: col.header,
      t: "s",
      s: {
        fill: {
          fgColor: { rgb: "1F4E78" }, // xanh đậm
        },
        font: {
          bold: true,
          color: { rgb: "FFFFFF" },
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
      },
    };
  });

  // 4. Auto width
  ws["!cols"] = exportColumns.map((col) => ({ wch: col.header.length + 5 }));

  // 5. Tạo workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Employees");

  // 6. Xuất file
  XLSX.writeFile(wb, "employees.xlsx");
}

function toggleFab() {
  document.querySelector(".fab-group").classList.toggle("active");
}

function toggleFabMenu() {
  document.getElementById("fabMenu").classList.toggle("show");
}
