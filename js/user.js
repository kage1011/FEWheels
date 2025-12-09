let jsonData = [];
let jsonPrize = [];
let jsonUserData = [];

const COLUMN_HEADERS = [
  "Số thẻ từ",
  "Mã nhân viên",
  "Tên nhân viên",
  "Bộ phận",
  "Phòng ban",
  "Tổ",
  // "Chức vụ",
  "Chuyên môn",
  "Thắng giải",
  "Hình ảnh",
];

// ===========================
// 1) AUTO LOAD LOCALSTORAGE
// ===========================
window.onload = async function () {
  let stored = localStorage.getItem("rewardUsers");

  // Load prizes và users đồng thời
  const [prizes, users] = await Promise.all([loadPrizes(), loadUser()]);

  jsonPrize = prizes;
  jsonUserData = users.filter((u) => u.isJoin == 1);
  jsonData = mapUserWithPrize(jsonUserData, jsonPrize);
  renderTableFromJSON(jsonData);
  console.log(jsonPrize, "prizes loaded");
  console.log("Đã load dữ liệu từ localStorage!");
};

document.getElementById("filterInput").addEventListener("input", function () {
  let keyword = this.value.toLowerCase();

  let filtered = jsonData.filter(
    (user) =>
      (user.UserName && user.UserName.toLowerCase().includes(keyword)) ||
      (user.UserCode && user.UserCode.toLowerCase().includes(keyword)) ||
      (user.prizeName && user.prizeName.toLowerCase().includes(keyword))
  );

  renderTableFromJSON(filtered);
});

async function loadPrizes() {
  try {
    const response = await fetch("../json/gift.json"); // đường dẫn tới file JSON
    if (!response.ok) throw new Error("Không thể đọc file JSON");
    const prizes = await response.json();
    return prizes; // trả về mảng prize
  } catch (err) {
    console.error(err);
    return [];
  }
}
async function loadUser() {
  try {
    // const users = await getUsersFromDB();
    const users = await getUsersFromDB();
    return users; // trả về mảng user
  } catch (err) {
    console.error(err);
    return [];
  }
}
function mapUserWithPrize(users, prizes) {
  return users.map((user) => {
    // Tìm prize tương ứng với user.isReward
    const prize = prizes.find((p) => p.id == user.IsReward);
    return {
      ...user,
      prizeName: prize ? prize.name : "",
    };
  });
}

// ===========================
// 2) HANDLE FILE IMPORT
// ===========================
document.getElementById("inputExcel").addEventListener("change", function (e) {
  let file = e.target.files[0];
  let reader = new FileReader();

  reader.onload = function () {
    let data = new Uint8Array(reader.result);
    let workbook = XLSX.read(data, { type: "array" });

    let firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    let excelRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

    jsonData = [];

    for (let i = 2; i < excelRows.length; i++) {
      let r = excelRows[i];
      if (r.length < 2) continue;
      jsonData.push({
        RFIDCard: r[2] || "",
        UserCode: r[3] || "",
        UserName: r[4] || "",
        Department: r[5] || "",
        Section: r[6] || "",
        Team: r[7] || "",
        Position: r[8] || "",
        JobTitle: r[9] || "",
        isReward: 0,
      });
    }

    renderTableFromJSON(jsonData);
  };

  reader.readAsArrayBuffer(file);
});

// ===========================
// 3) RENDER TABLE
// ===========================
// function renderTableFromJSON(data) {
//   let table = document.getElementById("excelTable");
//   table.innerHTML = "";

//   // Header
//   let headerRow = document.createElement("tr");
//   COLUMN_HEADERS.forEach((h) => {
//     let th = document.createElement("th");
//     th.textContent = h;
//     headerRow.appendChild(th);
//   });
//   table.appendChild(headerRow);

//   // Body
//   data.forEach((item) => {
//     let tr = document.createElement("tr");

//     let cols = [
//       item.AttendanceCard,
//       item.UserCode,
//       item.UserName,
//       item.Department,
//       item.Section,
//       item.Team,
//       // item.Position,
//       item.JobTitle,
//       item.prizeName,
//       "../assets/users/" + item.UserCode + ".JPG",
//     ];

//     cols.forEach((c, index) => {
//       let td = document.createElement("td");
//       // Nếu là cột cuối cùng (ảnh) → tạo img
//       if (index === cols.length - 1) {
//         let img = document.createElement("img");
//         img.src = c;
//         img.alt = item.UserName;
//         img.style.width = "50px";
//         img.style.height = "60px";
//         td.appendChild(img);
//       } else {
//         td.textContent = c;
//       }
//       tr.appendChild(td);
//     });

//     table.appendChild(tr);
//   });
// }

function renderTableFromJSON(data) {
  let tableHead = document.querySelector("#excelTable thead");
  let tableBody = document.querySelector("#excelTable tbody");

  tableHead.innerHTML = "";
  tableBody.innerHTML = "";

  // Header
  let headerRow = document.createElement("tr");
  COLUMN_HEADERS.forEach((h) => {
    let th = document.createElement("th");
    th.textContent = h;
    headerRow.appendChild(th);
  });
  tableHead.appendChild(headerRow);

  // Body
  data.forEach((item) => {
    let tr = document.createElement("tr");

    let cols = [
      item.AttendanceCard,
      item.UserCode,
      item.UserName,
      item.Department,
      item.Section,
      item.Team,
      item.JobTitle,
      item.prizeName,
      "../assets/users/" + item.UserCode + ".JPG",
    ];

    cols.forEach((c, index) => {
      let td = document.createElement("td");

      if (index === cols.length - 1) {
        let img = document.createElement("img");
        img.src = c;
        img.alt = item.UserName;
        img.style.width = "50px";
        img.style.height = "60px";
        td.appendChild(img);
      } else {
        td.textContent = c;
      }
      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });
}

// ===========================
// 4) CREATE SAVE BUTTON
// ===========================
document.getElementById("saveBtn").onclick = function () {
  localStorage.setItem("rewardUsers", JSON.stringify(jsonData));
  alert("Đã lưu dữ liệu vào LocalStorage!");
};

// ===========================
// DB Area
// ===========================
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
///// get all User
function getUsersFromDB() {
  return new Promise(async (resolve) => {
    const db = await openDB(); // Hàm openDB từ trước
    const tx = db.transaction("Users", "readonly");
    const store = tx.objectStore("Users");
    console.log(store);

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
