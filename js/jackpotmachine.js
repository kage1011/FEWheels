function createLights(containerId, bulbCount) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Xóa đèn cũ nếu có
  const existingContainer = container.querySelector(".lights-container");
  if (existingContainer) existingContainer.innerHTML = "";
  const lightLayer = existingContainer || container;

  // 1. Lấy thông số thực tế của khung
  const w = container.offsetWidth;
  const h = container.offsetHeight;

  // Lấy border-radius từ CSS
  const style = window.getComputedStyle(container);
  const rTL = parseFloat(style.borderTopLeftRadius) || 0;
  const rTR = parseFloat(style.borderTopRightRadius) || 0;
  const rBR = parseFloat(style.borderBottomRightRadius) || 0;
  const rBL = parseFloat(style.borderBottomLeftRadius) || 0;

  // 2. CÂN CHỈNH ĐỘ LỆCH (Quan trọng nhất)
  // Giả sử viền vàng dày 10px, ta muốn tâm đèn nằm ở vị trí 5px tính từ mép
  const inset = 6; // Khoảng cách từ mép ngoài vào tâm dải viền vàng
  const bulbSize = 12; // Kích thước bóng đèn
  const centerShift = bulbSize / 2; // Dịch chuyển để tâm đèn trùng tọa độ x,y

  // Điều chỉnh kích thước đường đi của đèn (lùi vào trong dải viền)
  const iW = w - inset * 2;
  const iH = h - inset * 2;
  const irTL = Math.max(0, rTL - inset);
  const irTR = Math.max(0, rTR - inset);
  const irBR = Math.max(0, rBR - inset);
  const irBL = Math.max(0, rBL - inset);

  // 3. Tính chu vi đường chạy của đèn
  const topL = iW - irTL - irTR;
  const rightL = iH - irTR - irBR;
  const bottomL = iW - irBR - irBL;
  const leftL = iH - irBL - irTL;
  const arc = Math.PI / 2;

  const perimeter =
    topL +
    arc * irTR +
    rightL +
    arc * irBR +
    bottomL +
    arc * irBL +
    leftL +
    arc * irTL;
  const step = perimeter / bulbCount;

  for (let i = 0; i < bulbCount; i++) {
    let d = i * step;
    let x, y;

    // Thuật toán chạy dọc chu vi hình chữ nhật bo góc
    if (d < topL) {
      // Cạnh trên
      x = irTL + d;
      y = 0;
    } else if (d < topL + arc * irTR) {
      // Góc trên phải
      let angle = -Math.PI / 2 + (d - topL) / irTR;
      x = iW - irTR + irTR * Math.cos(angle);
      y = irTR + irTR * Math.sin(angle);
    } else if (d < topL + arc * irTR + rightL) {
      // Cạnh phải
      let dSub = d - topL - arc * irTR;
      x = iW;
      y = irTR + dSub;
    } else if (d < topL + arc * irTR + rightL + arc * irBR) {
      // Góc dưới phải
      let angle = (d - topL - arc * irTR - rightL) / irBR;
      x = iW - irBR + irBR * Math.cos(angle);
      y = iH - irBR + irBR * Math.sin(angle);
    } else if (d < topL + arc * irTR + rightL + arc * irBR + bottomL) {
      // Cạnh dưới
      let dSub = d - topL - arc * irTR - rightL - arc * irBR;
      x = iW - irBR - dSub;
      y = iH;
    } else if (
      d <
      topL + arc * irTR + rightL + arc * irBR + bottomL + arc * irBL
    ) {
      // Góc dưới trái
      let angle =
        Math.PI / 2 +
        (d - topL - arc * irTR - rightL - arc * irBR - bottomL) / irBL;
      x = irBL + irBL * Math.cos(angle);
      y = iH - irBL + irBL * Math.sin(angle);
    } else if (d < perimeter - arc * irTL) {
      // Cạnh trái
      let dSub =
        d - topL - arc * irTR - rightL - arc * irBR - bottomL - arc * irBL;
      x = 0;
      y = iH - irBL - dSub;
    } else {
      // Góc trên trái
      let angle = Math.PI + (d - (perimeter - arc * irTL)) / irTL;
      x = irTL + irTL * Math.cos(angle);
      y = irTL + irTL * Math.sin(angle);
    }

    // Tạo Element bóng đèn
    const bulb = document.createElement("div");
    bulb.className = "bulb";

    // Cộng thêm 'inset' để bù lại khoảng lùi, và trừ 'centerShift' để căn giữa bóng đèn
    bulb.style.left = x + inset - centerShift + "px";
    bulb.style.top = y + inset - centerShift + "px";

    // Hiệu ứng nháy đuổi
    bulb.style.animationDelay = i * 0.1 + "s";

    lightLayer.appendChild(bulb);
  }
}

// Gọi hàm khi trang tải xong
window.onload = () => {
  createLights("lights-middle", 100);
};

function renderGachaRows(slotCount) {
  const container = document.getElementById("gachaRows");
  console.log("Slot count:", slotCount);
  container.innerHTML = "";
  // row 5
  if (slotCount == undefined) {
    slotCount = 5;
  }
  if (slotCount == 5) {
    let div = document.createElement("div");
    div.className = "numbers-row";
    let html = "";
    for (let i = 1; i <= 6; i++) {
      html += `<div class="number" id="num_${4}_${i}">0</div>`;
    }
    div.innerHTML = html;
    container.appendChild(div);
  }
  // row 3
  if (slotCount == 5 || slotCount == 6) {
    div = document.createElement("div");
    div.className = "numbers-row";
    html = "";
    for (let i = 1; i <= 6; i++) {
      html += `<div class="number" id="num_${2}_${i}">0</div>`;
    }
    div.innerHTML = html;
    container.appendChild(div);
  }
  // row 1
  div = document.createElement("div");
  div.className = "numbers-row";
  html = "";
  for (let i = 1; i <= 6; i++) {
    html += `<div class="number" id="num_${0}_${i}">0</div>`;
  }
  div.innerHTML = html;
  container.appendChild(div);

  // row 2
  if (slotCount == 5 || slotCount == 6 || slotCount == 2) {
    div = document.createElement("div");
    div.className = "numbers-row";
    html = "";
    for (let i = 1; i <= 6; i++) {
      html += `<div class="number" id="num_${1}_${i}">0</div>`;
    }
    div.innerHTML = html;
    container.appendChild(div);
  }
  // row 4
  if (slotCount == 5) {
    div = document.createElement("div");
    div.className = "numbers-row";
    html = "";
    for (let i = 1; i <= 6; i++) {
      html += `<div class="number" id="num_${3}_${i}">0</div>`;
    }
  }
  div.innerHTML = html;
  container.appendChild(div);

  const elements = document.querySelectorAll(".number");
  if (slotCount <= 3) {
    elements.forEach((el) => {
      el.style.width = "70px";
      el.style.height = "80px";
    });
  } else {
    elements.forEach((el) => {
      el.style.width = "60px";
      el.style.height = "70px";
    });
  }
}
