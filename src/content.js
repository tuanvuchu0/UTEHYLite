import ical from "ical-generator";

const logout = document.querySelector(".dropdown.login-container");
if (logout) {
  const logoutLink = logout.querySelector("a");
  logoutLink.addEventListener("click", () => {
    chrome.storage.local.remove("autoLogin");
  });
}

const isLogin = document.querySelector(".dropdown.login-container");
if (!isLogin) {
  chrome.storage.local.get("autoLogin", (result) => {
    if (result.autoLogin) {
      const { username, password } = result.autoLogin;
      const formData = new FormData();
      formData.append("Role", "0");
      formData.append("Username", username);
      formData.append("password", password);
      fetch("/DangNhap/CheckLogin", { method: "POST", body: formData })
        .then(() => {
          window.location.href = "https://qldaotao.utehy.edu.vn/";
        })
        .catch((error) => console.error(error));
    }
  });
}

if (document.referrer === "https://qldaotao.utehy.edu.vn/DangNhap/Login") {
  if (isLogin) {
    const savedData = localStorage.getItem("autoLogin");
    if (savedData) {
      chrome.storage.local.set({ autoLogin: JSON.parse(savedData) }, () => {
        localStorage.removeItem("autoLogin");
      });
    }
  }
}

const handlers = [
  {
    key: "DangNhap",
    applyFunction: () => {
      const autoLoginDiv = document.createElement("div");
      autoLoginDiv.classList.add("form-group", "form-check");
      const autoLoginInput = document.createElement("input");
      autoLoginInput.setAttribute("type", "checkbox");
      autoLoginInput.classList.add("form-check-input");
      autoLoginInput.id = "autoLogin";
      autoLoginInput.addEventListener("change", () => {
        const username = document.getElementById("Username").value;
        const password = document.getElementById("login-password").value;

        if (autoLoginInput.checked) {
          const loginData = {
            username: username,
            password: password,
          };
          localStorage.setItem("autoLogin", JSON.stringify(loginData));
        } else {
          localStorage.removeItem("autoLogin");
        }
      });
      const autoLoginLabel = document.createElement("label");
      autoLoginLabel.setAttribute("for", "autoLogin");
      autoLoginLabel.classList.add("form-check-label");
      autoLoginLabel.innerText = "Nhớ tôi";

      autoLoginDiv.appendChild(autoLoginInput);
      autoLoginDiv.appendChild(autoLoginLabel);
      const passwordInput = document.getElementById("login-password");
      passwordInput.parentElement.insertAdjacentElement(
        "afterend",
        autoLoginDiv,
      );
    },
  },
  {
    key: "TraCuuLichHoc",
    applyFunction: () => {
      const printBtn = document.querySelectorAll(".btn.btn-warning.btn-sm");

      printBtn.forEach((p) => {
        const downloadTimetable = document.createElement("div");
        downloadTimetable.classList.add("col-md-2");
        const linkDownloadTimetable = document.createElement("a");
        linkDownloadTimetable.classList.add("btn", "btn-info", "btn-sm");
        linkDownloadTimetable.setAttribute("href", "#");
        linkDownloadTimetable.addEventListener("click", (e) => {
          e.preventDefault();
          createIcs();
        });
        const iconDownloadTimetable = document.createElement("i");
        iconDownloadTimetable.classList.add("fa", "fa-download");
        linkDownloadTimetable.appendChild(iconDownloadTimetable);
        linkDownloadTimetable.appendChild(
          document.createTextNode(" Tải lịch học"),
        );

        downloadTimetable.appendChild(linkDownloadTimetable);

        p.parentElement.insertAdjacentElement("beforebegin", downloadTimetable);
      });
    },
  },
  {
    key: "DanhGiaMonHoc",
    applyFunction: () => {
      const observer = new MutationObserver(() => {
        const check = document.getElementById("loptc");
        if (check.value === "-1") {
          return;
        }
        const saveBtn = document.querySelector(".btn.btn-danger");
        if (!saveBtn) return;
        const tr = saveBtn.closest("tr");
        if (!tr) return;
        const td = tr.querySelector('td[colspan="7"]');
        if (!td) return;
        const autoFillTd = document.createElement("td");
        autoFillTd.classList.add("text-center", "align-middle");

        const linkAutoFill = document.createElement("a");
        linkAutoFill.classList.add("btn", "btn-info");
        linkAutoFill.href = "#";
        linkAutoFill.addEventListener("click", (e) => {
          e.preventDefault();
          autoFill();
        });

        const iconAutoFill = document.createElement("i");
        iconAutoFill.classList.add("fa", "fa-refresh");

        linkAutoFill.appendChild(iconAutoFill);
        linkAutoFill.appendChild(document.createTextNode(" Tự động điền"));
        autoFillTd.appendChild(linkAutoFill);

        const passEvaluationTd = document.createElement("td");
        passEvaluationTd.classList.add("text-center", "align-middle");

        const linkPassEvaluation = document.createElement("a");
        linkPassEvaluation.classList.add("btn", "btn-danger");
        linkPassEvaluation.href = "#";
        linkPassEvaluation.addEventListener("click", (e) => {
          e.preventDefault();
          passEvaluation();
        });

        const iconPassEvaluation = document.createElement("i");
        iconPassEvaluation.classList.add("fa", "fa-eye");

        linkPassEvaluation.appendChild(iconPassEvaluation);
        linkPassEvaluation.appendChild(
          document.createTextNode(" Xem điểm ngay"),
        );
        passEvaluationTd.appendChild(linkPassEvaluation);

        td.setAttribute("colspan", "3");
        td.insertAdjacentElement("afterend", passEvaluationTd);
        td.insertAdjacentElement("afterend", autoFillTd);
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    },
  },
];

handlers.forEach((p) => {
  if (window.location.href.includes(p.key)) {
    try {
      p.applyFunction();
    } catch (error) {
      console.error(p.key, error);
    }
  }
});

function autoFill() {
  const tds = document.querySelectorAll("td");
  const matched = Array.from(tds).filter(
    (td) => td.textContent.trim() === "Rất đồng ý",
  );
  matched.forEach((td) => {
    const radio = td.querySelector('input[type="radio"]');
    radio.checked = true;
  });
  const remark = document.querySelector("textarea");
  remark.value = "Không";
}

function passEvaluation() {
  const loaiMonHoc = document.getElementById("loaimonhoc").value;
  let _url = "";

  switch (loaiMonHoc) {
    case "1":
      _url = "/DichVu/DanhGiaMonHoc/_SaveMonCaoHoc";
      break;
    case "2":
      _url = "/DichVu/DanhGiaMonHoc/_SaveMonQuocPhongAnNinh";
      break;
    case "3":
      _url = "/DichVu/DanhGiaMonHoc/_SaveMonLyThucHanhThiNghiem";
      break;
    case "4":
      _url = "/DichVu/DanhGiaMonHoc/_SaveMonLyThuyetTichHop";
      break;
  }
  const payload = {
    StringArrRadio: JSON.stringify(["7_193"]),
    StringArrText: JSON.stringify([]),
    StringArrCheck: JSON.stringify([]),
    ID_lop_tc: document.getElementById("loptc").value,
  };

  fetch(_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then(() => {
      window.location.href = "/TraCuuDiem/Index";
    })
    .catch((error) => {
      console.error(error);
    });
}

function formatData() {
  const tables = document.querySelectorAll(
    ".table.table-bordered.table-condensed",
  );

  for (const table of tables) {
    const firstTh = table.querySelector("th");
    if (!firstTh || firstTh.textContent.trim() !== "STT") continue;

    table.querySelectorAll('td[style*="width: 110px"]').forEach((td) => {
      td.textContent = td.textContent
        .replace("Nhà Điều hành-", "")
        .replace("(TH)", "");
    });

    table.querySelectorAll('td[style*="width: 160px"]').forEach((td) => {
      if (td.getAttribute("align") === "left") td.remove();
    });

    const removeList = [
      "Mã học phần",
      "STT",
      "Số tín chỉ",
      "Tên lớp tín chỉ",
      "Giáo viên",
      "Duyệt",
    ];
    table.querySelectorAll("th").forEach((th) => {
      if (removeList.includes(th.textContent.trim())) th.remove();
    });

    table
      .querySelectorAll(
        'td[style*="width: 180px"], td[style*="width: 80px"], td[style*="width:35px"]',
      )
      .forEach((td) => td.remove());

    table.querySelectorAll("td").forEach((td) => {
      const style = td.getAttribute("style") || "";
      if (
        !style.includes("width: 75px") &&
        !isNaN(Number(td.textContent.trim()))
      ) {
        td.remove();
      }
    });

    const timeMap = {
      1: "071500-080500",
      2: "081000-090000",
      3: "090500-095500",
      4: "100500-105500",
      5: "110000-115000",
      7: "124500-133500",
      8: "134000-143000",
      9: "143500-152500",
      10: "153500-162500",
      11: "163000-172000",
      12: "172000-181000",
      13: "181500-190500",
      14: "191000-200000",
    };

    table.querySelectorAll('td[style*="width: 50px"]').forEach((td) => {
      const text = td.textContent.trim();
      if (text.includes("-")) {
        const [start, end] = text.split("-").map(Number);
        if (timeMap[start] && timeMap[end]) {
          td.textContent =
            timeMap[start].slice(0, 6) + "-" + timeMap[end].slice(-6);
        }
      } else if (timeMap[text]) {
        td.textContent = timeMap[text];
      }
    });

    const data = [];
    const rowspanMap = {};

    table.querySelectorAll("tbody tr").forEach((tr) => {
      const rowData = [];
      let colIndex = 0;

      tr.querySelectorAll("td").forEach((td) => {
        while (rowspanMap[colIndex] && rowspanMap[colIndex].count > 0) {
          rowData.push(rowspanMap[colIndex].value);
          rowspanMap[colIndex].count--;
          colIndex++;
        }

        const value = td.textContent.trim();
        const rowspan = parseInt(td.getAttribute("rowspan")) || 1;
        rowData.push(value);

        if (rowspan > 1) {
          rowspanMap[colIndex] = { value, count: rowspan - 1 };
        }

        colIndex++;
      });

      while (rowspanMap[colIndex] && rowspanMap[colIndex].count > 0) {
        rowData.push(rowspanMap[colIndex].value);
        rowspanMap[colIndex].count--;
        colIndex++;
      }

      data.push(rowData);
    });

    return data;
  }
}

function parseDate(str) {
  const [d, m, y] = str.split("/").map(Number);
  return new Date(y, m - 1, d);
}

function createIcs() {
  const data = formatData();
  const cal = ical({
    name: "Lịch học",
    method: "PUBLISH",
    scale: "GREGORIAN",
  });

  data.forEach((p) => {
    const [tenMon, khoangNgay, thu, khoangThoiGian, phong] = p;
    if (!tenMon || !khoangNgay || !thu || !khoangThoiGian) return;

    const [startDateStr, endDateStr] = khoangNgay.split("-");
    const startDate = parseDate(startDateStr);
    const endDate = parseDate(endDateStr);

    const [startTimeStr, endTimeStr] = khoangThoiGian.split("-");

    const setThu = Number(thu);
    if (isNaN(setThu)) return;
    const offset = (setThu + 7 - startDate.getDay()) % 7;
    let eventDate = new Date(startDate);
    eventDate.setDate(eventDate.getDate() + offset);

    const [sh, sm, ss] = [
      startTimeStr.slice(0, 2),
      startTimeStr.slice(2, 4),
      startTimeStr.slice(4, 6),
    ].map(Number);

    const [eh, em, es] = [
      endTimeStr.slice(0, 2),
      endTimeStr.slice(2, 4),
      endTimeStr.slice(4, 6),
    ].map(Number);

    while (eventDate <= endDate) {
      const dtStart = new Date(eventDate);
      dtStart.setHours(sh, sm, ss, 0);

      const dtEnd = new Date(eventDate);
      dtEnd.setHours(eh, em, es, 0);

      cal.createEvent({
        start: dtStart,
        end: dtEnd,
        summary: `(${phong}) ${tenMon}`,
        uid: crypto.randomUUID(),
        timezone: "Asia/Ho_Chi_Minh",
        // Hiển thị thông báo trước 1 tiếng
        alarms: [{ type: "display", triggerBefore: 60 * 60 }],
      });
      eventDate.setDate(eventDate.getDate() + 7);
    }
  });

  const blob = new Blob([cal.toString()], {
    type: "text/calendar;charset=utf-8",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "timetable.ics";
  link.click();
}
