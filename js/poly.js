//sự kiện click nút giỏ hàng
const tabPanel = document.getElementById("myTabPanel");
const closeButton = document.getElementById("closeTab");

function opentabGiohang() {
  if (tabPanel.classList.contains("active")) {
    openTab.style.removeProperty("background-color");
    openTab.style.removeProperty("color");
    tabPanel.classList.remove("active");
    closeButton.style.transform = "rotate(0deg)";
  } else {
    tabPanel.classList.add("active");
    tabPanel.style.width = "700px"; // Điều chỉnh độ rộng của tab pane tùy theo nhu cầu
    tabPanel.style.backgroundColor = "#fff5f5";
    openTab.style.backgroundColor = "#fff5f5";
    openTab.style.color = "black";
    trashGioHang();
    tangSoluong();
    giamSoluong();

    document.addEventListener("keyup", function (event) {
      if (event.key === "Escape") {
        openTab.style.removeProperty("background-color");
        openTab.style.removeProperty("color");
        tabPanel.classList.remove("active");
        closeButton.style.transform = "rotate(0deg)";
      }
    });

    closeButton.style.transform = "rotate(90deg)";
  }
};

document.getElementById("closeTab").addEventListener("click", function () {
  document.getElementById("myTabPanel").classList.remove("active");
  document.getElementById("closeTab").style.transform = "rotate(0deg)";
  openTab.style.removeProperty("background-color");
  openTab.style.removeProperty("color");
});

// thao tác trong giỏ hàng: click xóa
function trashGioHang() {
  var trash_gioHang = document.querySelectorAll(".trash-giohang");
  if (trash_gioHang.length === 0) {
    return;
  }

  trash_gioHang.forEach(function (item) {
    item.addEventListener("click", function (event) {
      var isTrashClick = event.currentTarget.classList.contains("trash-giohang");
      if (isTrashClick) {
        var tbody = document.getElementById("giohang-tbody");
        var trRemove = item.closest("tr");

        if (trRemove) {
          var titleElement = trRemove.querySelector(".title-giohang");
          var textContent = titleElement ? titleElement.textContent : "";

          var confirmation = confirm(
            'Bạn có muốn xóa đơn hàng "' + textContent + '" không?'
          );

          if (confirmation) {
            tbody.removeChild(trRemove);
            toastOpen('Đã xóa đơn hàng "' + textContent + '"');
            updateGioHang();
          }
        }
      }
    });
  });
}
// function tăng số lượng
function tangSoluong() {
  var tang_SL = document.querySelectorAll(".tang-soluong");
  if (tang_SL.length === 0) {
    return;
  }

  tang_SL.forEach(function (item) {
    item.addEventListener("click", function (event) {
      var isTangClick = event.currentTarget.classList.contains("tang-soluong");
      if (isTangClick) {
        var tbody = document.getElementById("giohang-tbody");
        var tr = item.closest("tr");
        var countElement = tr.querySelector(".count-giohang");

        if (countElement) {
          var count = parseInt(countElement.textContent);
          count++;
          console.log(count);
          countElement.textContent = count;
        }
      }
    });
  });
}

// function giảm số lượng
function giamSoluong() {
  var giam_SL = document.querySelectorAll(".giam-soluong");
  if (giam_SL.length === 0) {
    return;
  }

  giam_SL.forEach(function (item) {
    item.addEventListener("click", function (event) {
      var isGiamClick = event.currentTarget.classList.contains("giam-soluong");
      if (isGiamClick) {
        var tbody = document.getElementById("giohang-tbody");
        var tr = item.closest("tr");
        var countElement = tr.querySelector(".count-giohang");

        if (countElement) {
          var count = parseInt(countElement.textContent);
          if (count > 1) {
            count--;
            console.log(count);
            countElement.textContent = count;
          } else {
            // Handle the case when count is already 1 or less, e.g., disable the button
            countElement.textContent = count;

          }
        }
      }
    });
  });
}
function toastOpen(content) {
  var toastLiveExample = document.getElementById("liveToast");

  if (toastLiveExample) {
    var toastBootstrap = new bootstrap.Toast(toastLiveExample, {
      animation: true,
      autohide: true,
      delay: 3000,
    });
    var contentToast = document.getElementById("toast-content");
    contentToast.textContent = content;

    // Hiển thị toast
    toastBootstrap.show();

    // Thêm lớp 'hide' để kích hoạt hiệu ứng khi toast biến mất
    setTimeout(function () {
      toastLiveExample.classList.add("hide");
    }, 3000);
  }
}

// Hiển thị toast
document.getElementById('liveToast').classList.remove('hide');

// Ẩn toast
document.getElementById('liveToast').classList.add('hide');




function updateGioHang(){
  var trash_gioHang = document.querySelectorAll(".trash-giohang");
  console.log("update: trash=: " + trash_gioHang.length);
  var count_gio_hang = document.getElementById("count-giohang");
  count_gio_hang.textContent = trash_gioHang.length;
  count_gio_hang.style.backgroundColor ="red";
}
