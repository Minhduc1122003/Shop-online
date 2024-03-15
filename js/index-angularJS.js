var img_item = "";
var title_item = "";
var id_item = "";

var price_item = "";
var app = angular.module("myapp", ["ngRoute"]);
app.controller("myctrl", [
  "$scope",
  "$http",
  "$location",
  "$timeout",
  "$window",
  function ($scope, $http, $location, $timeout, $window) {
    $scope.products = [];
    $scope.giohang_total = [];
    $scope.giohang_account = [];
    $scope.giohang_adding = [];
    $scope.giohang_daxoa = [];
    $scope.find = [];
    $scope.find_select = {
      price: 0,
    };

    // $scope.giohang_dasua = [];
    $scope.selectedSize = "";
    $scope.accountList = [];
    $scope.user = {
      id: "",
      email: "",
      name: "",
      password: "",
      birthday: "",
      phone: "",
      gender: "",
      islogin: false,
    };
    $scope.birthday = {
      dd: "",
      mm: "",
      yyyy: "",
    };
    $scope.email_hidden = {};
    $http.get("http://localhost:3000/products").then(function (response) {
      $scope.products = response.data;
      console.log(
        "Dữ liệu đã được tải thành công từ http://localhost:3000/products:",
        $scope.products
      );
      console.log("Số lượng item:", $scope.products.length);

      $scope.totalItems = $scope.products.length;

      $scope.begin = 0;
      $scope.pageSize = 12;
      $scope.pageCount = Math.ceil($scope.products.length / 12);
      console.log("pageCount: " + $scope.begin);

      $scope.next = function () {
        if ($scope.begin < ($scope.pageCount - 1) * 12) {
          $scope.begin += 12;
          console.log("next: " + $scope.begin);
          getCurrentPage();
        }
      };
      $scope.prev = function () {
        if ($scope.begin > 0) {
          $scope.begin -= 12;
          getCurrentPage();
        }
      };
      getCurrentPage = function () {
        $scope.tranghientai = Math.floor($scope.begin / $scope.pageSize) + 1;
        $scope.totalPages = Math.ceil($scope.totalItems / $scope.pageSize);
        console.log("Tổng số trang: " + $scope.totalPages);
        console.log("trang hiện tại: " + $scope.tranghientai);
        console.log("item: " + $scope.totalItems);
      };
      console.log(getCurrentPage());
    });
    function uploadDataAccount(scopeVariable, data) {
      // Xử lý dữ liệu mới
      console.log(scopeVariable + " =", data);

      // Cập nhật giá trị của biến trong $scope
      $scope.$apply(function () {
        $scope[scopeVariable] = data;
      });
    }
    fetchData("http://localhost:3000/accountList", function (data) {
      uploadDataAccount("accountList", data);
    });
    fetchData("http://localhost:3000/giohang-items", function (data) {
      uploadDataAccount("giohang_total", data);
      $scope.giohang_account.splice(0, $scope.giohang_account.length);

      // Kiểm tra xem 'user' có tồn tại trong Local Storage hay không
      var userJson = localStorage.getItem("user");
      // Chuyển đổi chuỗi JSON thành đối tượng JavaScript
      var userObject = JSON.parse(userJson);
      var userExists = localStorage.getItem("user") !== null;

      // Hiển thị kết quả kiểm tra
      if (userExists) {
        console.log("Người dùng đã tồn tại trong Local Storage");
        $scope.user = {
          id: userObject.id,
          email: userObject.email,
          name: userObject.name,
          password: userObject.password,
          birthday: userObject.birthday,
          gender: userObject.gender,
          islogin: true,
          img: userObject.img,
        };
        var email_hidden1 = hideEmail(userObject.email);
        $scope.email_hidden = {
          email_hidden2: email_hidden1,
        };
        var birthdayString = userObject.birthday;
        var parts = birthdayString.split("/");
        $scope.birthday = {
          dd: parts[0],
          mm: parts[1],
          yyyy: parts[2],
        };
        $scope.checkEmail = function () {
          var email = document.getElementById("email-check").value;
          if (email === $scope.user.email) {
            console.log("email khớp: ", email);
            
            sendEmail(email);

            $("#exampleModalToggle").modal("hide"); // Ẩn modal hiện tại
            $timeout(function () {
              $("#exampleModalToggle2").modal("show");

            }, 1000);
            $("#exampleModalToggle2").modal("show");
          } else {
            toastOpen("Email không trùng khớp với tài khoản");
          }
        };
        // update giỏ hàng khi đăng nhập
        console.log("giohang:", $scope.giohang_total);
        for (var i = 0; i < $scope.giohang_total.length; i++) {
          var user2 = $scope.giohang_total[i];
          if ($scope.user.id === user2.id_account) {
            $scope.giohang_account.push({
              id: user2.id,
              id_account: user2.id_account,
              img_items: user2.img_items,
              title_items: user2.title_items,
              price_items: user2.price_items,
              count_items: user2.count_items,
              sum_price_items: user2.price_items * user2.count_items,
            });
          }
        }
        $scope.itemCount = $scope.giohang_account.length;

        $timeout(function () {
          $scope.updateGioHang();
        }, 200);
      } else {
        console.log("Người dùng không tồn tại trong Local Storage");
      }
      $scope.tongtien = 0;
      $scope.select = function (index) {
        var select_items = document.getElementsByClassName("select-item");
        var tongtien = 0;

        for (var i = 0; i < select_items.length; i++) {
          if (select_items[i].checked) {
            tongtien += $scope.giohang_account[i].sum_price_items;
          }
          $scope.tongtien = tongtien;
          // Lấy thẻ tr (hàng) tương ứng với checkbox được click
          var tr = select_items[index].parentNode.parentNode;

          // Nếu checkbox được chọn, thêm lớp 'selected-row', ngược lại loại bỏ lớp này
          if (select_items[index].checked) {
            tr.classList.add("selected-row");
          } else {
            tr.classList.remove("selected-row");
          }
        }
      };

      $scope.selectAll = function () {
        var check = document.getElementById("selectAll");
        var check2 = document.getElementById("selectAll2");

        var select_items = document.getElementsByClassName("select-item");
        var tongtien = 0;
        if (check.checked) {
          for (let index = 0; index < select_items.length; index++) {
            select_items[index].checked = true;
            tongtien += $scope.giohang_account[index].sum_price_items;
            $scope.tongtien = tongtien;
          }
          check2.checked = true;
        } else {
          for (let index = 0; index < select_items.length; index++) {
            select_items[index].checked = false;
            check2.checked = false;

            tongtien = 0;
            $scope.tongtien = tongtien;
          }
        }

        console.log("tổng tiền", tongtien);
      };
      $scope.selectAll2 = function () {
        var check = document.getElementById("selectAll");

        var check2 = document.getElementById("selectAll2");
        var select_items = document.getElementsByClassName("select-item");
        var tongtien = 0;
        if (check2.checked) {
          for (let index = 0; index < select_items.length; index++) {
            select_items[index].checked = true;
            tongtien += $scope.giohang_account[index].sum_price_items;
            $scope.tongtien = tongtien;
          }
          if (check.checked == false) {
            check.checked = true;
          }
        } else {
          for (let index = 0; index < select_items.length; index++) {
            select_items[index].checked = false;
            check.checked = false;
            tongtien = 0;
            $scope.tongtien = tongtien;
          }
        }
        console.log("tổng tiền", tongtien);
      };
    });

    // kiểm tra local Storage:

    $scope.logMessage = function (clickedProduct) {
      console.log("User clicked on the list item:", clickedProduct);
      img_item = clickedProduct.img;
      title_item = clickedProduct.title;
      price_item = clickedProduct.price;
      openTabitems();
      setAttributeItems(img_item, title_item, price_item);
    };
    $scope.themgiohang = function () {
      var count_item = document.getElementById("count-input");
      var count_item_int = parseInt(count_item.value);
      console.log("gio hang account11", $scope.giohang_account);
      var find = $scope.giohang_account.findIndex(
        (item) => item.price_items === title_item
      );
      var count_default = 0;
      var id_account = "";
      var img_items = "";
      var price_items = 0;
      // tìm id của sản phẩm
      for (var i = 0; i < $scope.giohang_account.length; i++) {
        title2 = $scope.giohang_account[i].title_items;
        if (title_item == title2) {
          id_item = $scope.giohang_account[i].id;
          count_default = $scope.giohang_account[i].count_items;
          id_account = $scope.giohang_account[i].id_account;
          img_items = $scope.giohang_account[i].img_items;
          price_items = $scope.giohang_account[i].price_items;
          break;
        }
      }

      console.log("id của sản phẩm: ", id_item);
      console.log("id của account: ", id_account);
      console.log("img của sản phẩm: ", img_items);
      console.log("title của account: ", title_item);
      console.log("price của sản phẩm: ", price_items);

      // kiểm tra nếu người dùng nhập số lượng sp = ""
      if (count_item_int == null || isNaN(count_item_int)) {
        count_item_int = 1;
        count_item.value = 1;
      }
      var sum_count = count_item_int + count_default;

      if (id_item) {
        var updateData = {
          id: id_item,
          id_account: id_account,
          img_items: img_items,
          title_items: title_item,
          price_items: price_items,
          count_items: sum_count,
        };
        // gửi yêu cầu cập nhật
        toastOpen("Cập nhật sản phẩm thành công!");

        $scope.giohang_account.splice(0, $scope.giohang_account.length);
        $timeout(function () {
          fetch("http://localhost:3000/giohang-items/" + id_item, {
            method: "PUT", // Hoặc 'PATCH' tùy thuộc vào yêu cầu của server
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log("Dữ liệu đã được cập nhật:", data);
            })
            .catch((error) => {
              console.error("Lỗi khi cập nhật dữ liệu:", error);
              // Xử lý khi có lỗi
            });
          $scope.updateGioHang();
        }, 1000);
      } else {
        if ($scope.user.id == "") {
          toastOpen("Bạn cần đăng nhập để sử dụng giỏ hàng!");
          return;
        } else {
          $scope.giohang_account_new = {
            id_account: $scope.user.id,
            img_items: img_item,
            title_items: title_item,
            price_items: price_item,
            count_items: count_item_int,
          };

          console.log($scope.giohang_account);
          toastOpen("Thêm mới sản phẩm thành công!");

          $scope.giohang_account.splice(0, $scope.giohang_account.length);
          $timeout(function () {
            postData(
              $scope.giohang_account_new,
              "http://localhost:3000/giohang-items"
            );
            $scope.updateGioHang();
          }, 1000);
        }
      }
    };

    $scope.index = -1;
    var clickTimeout;

    $scope.tangSL = function (index) {
      $scope.giohang_account[index].count_items += 1;
      $scope.giohang_account[index].sum_price_items == 0;
      $scope.giohang_account[index].sum_price_items =
        $scope.giohang_account[index].count_items *
        $scope.giohang_account[index].price_items;
    };
    $scope.giamSL = function (index) {
      if ($scope.giohang_account[index].count_items == 1) {
        toastOpen("Số lượng đã đến mức tối thiểu!");
        return;
      } else {
        $scope.giohang_account[index].count_items -= 1;
        $scope.giohang_account[index].sum_price_items == 0;
        $scope.giohang_account[index].sum_price_items =
          $scope.giohang_account[index].count_items *
          $scope.giohang_account[index].price_items;
      }
    };
    $scope.tangSL2 = function (index) {
      $scope.giohang_account[index].count_items += 1;
      $scope.giohang_account[index].sum_price_items == 0;
      $scope.giohang_account[index].sum_price_items =
        $scope.giohang_account[index].count_items *
        $scope.giohang_account[index].price_items;
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(function () {
        console.log("Người dùng đã ngưng click");
        // post data khi ngừng click
        $timeout(function () {
          for (var i = 0; i < $scope.giohang_account.length; i++) {
            var item = $scope.giohang_account[i];
            var updateData = {
              id: item.id,
              id_account: item.id_account,
              img_items: item.img_items,
              title_items: item.title_items,
              price_items: item.price_items,
              count_items: item.count_items,
            };
            fetch("http://localhost:3000/giohang-items/" + item.id, {
              method: "PUT", // Hoặc 'PATCH' tùy thuộc vào yêu cầu của server
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updateData),
            })
              .then((response) => response.json())
              .then((data) => {
                console.log("Dữ liệu đã được cập nhật:", data);
              })
              .catch((error) => {
                console.error("Lỗi khi cập nhật dữ liệu:", error);
                // Xử lý khi có lỗi
              });
          }
          console.log("gio hang da xoa 2", $scope.giohang_daxoa);
          for (var i = 0; i < $scope.giohang_daxoa.length; i++) {
            var item = $scope.giohang_daxoa[i];
            fetch("http://localhost:3000/giohang-items/" + item.id, {
              method: "DELETE",
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
              })
              .then((data) => {
                console.log("Deleted successfully:", data);
              })
              .catch((error) => {
                console.error("Error during deletion:", error);
              });
          }
        }, 250);
      }, 500); // 1000 milliseconds = 1 giây
    };
    $scope.giamSL2 = function (index) {
      if ($scope.giohang_account[index].count_items == 1) {
        toastOpen("Số lượng đã đến mức tối thiểu!");
        return;
      } else {
        $scope.giohang_account[index].count_items -= 1;
        $scope.giohang_account[index].sum_price_items == 0;
        $scope.giohang_account[index].sum_price_items =
          $scope.giohang_account[index].count_items *
          $scope.giohang_account[index].price_items;
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(function () {
          console.log("Người dùng đã ngưng click");
          // post data khi ngừng click
          $timeout(function () {
            for (var i = 0; i < $scope.giohang_account.length; i++) {
              var item = $scope.giohang_account[i];
              var updateData = {
                id: item.id,
                id_account: item.id_account,
                img_items: item.img_items,
                title_items: item.title_items,
                price_items: item.price_items,
                count_items: item.count_items,
              };
              fetch("http://localhost:3000/giohang-items/" + item.id, {
                method: "PUT", // Hoặc 'PATCH' tùy thuộc vào yêu cầu của server
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
              })
                .then((response) => response.json())
                .then((data) => {
                  console.log("Dữ liệu đã được cập nhật:", data);
                })
                .catch((error) => {
                  console.error("Lỗi khi cập nhật dữ liệu:", error);
                  // Xử lý khi có lỗi
                });
            }
            console.log("gio hang da xoa 2", $scope.giohang_daxoa);
            for (var i = 0; i < $scope.giohang_daxoa.length; i++) {
              var item = $scope.giohang_daxoa[i];
              fetch("http://localhost:3000/giohang-items/" + item.id, {
                method: "DELETE",
              })
                .then((response) => {
                  if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                  }
                  return response.json();
                })
                .then((data) => {
                  console.log("Deleted successfully:", data);
                })
                .catch((error) => {
                  console.error("Error during deletion:", error);
                });
            }
          }, 250);
        }, 500); // 1000 milliseconds = 1 giây
      }
    };
    // hàm delete json-server

    $scope.delete = function (index) {
      var confirmDelete = confirm(
        "Bạn có chắc chắn muốn xóa sản phẩm " +
          $scope.giohang_account[index].title_items +
          " không?"
      );

      if (confirmDelete) {
        $scope.index = index;
        var id_SP = $scope.giohang_account[index].id;

        console.log("id sp là: ", id_SP);
        $scope.index = index;
        $scope.giohang_account.splice(index, 1);
        console.log("giohangsaukhixoa", $scope.giohang_account);

        $scope.giohang_daxoa.push({
          id: id_SP,
        });
        console.log("đã xóa sp: ", $scope.giohang_daxoa);
        toastOpen("Đã xóa sản phẩm khỏi giỏ hàng!");
        $scope.updateGioHang();
      } else {
        return;
      }
    };
    // delete2 để thao tác bên trong giỏ hàng chi tiết
    $scope.delete2 = function (index) {
      var confirmDelete = confirm(
        "Bạn có chắc chắn muốn xóa sản phẩm " +
          $scope.giohang_account[index].title_items +
          " không?"
      );

      if (confirmDelete) {
        $scope.index = index;
        var id_SP = $scope.giohang_account[index].id;

        console.log("id sp là: ", id_SP);
        $scope.index = index;
        $scope.giohang_account.splice(index, 1);
        console.log("giohangsaukhixoa", $scope.giohang_account);

        $scope.giohang_daxoa.push({
          id: id_SP,
        });
        console.log("đã xóa sp: ", $scope.giohang_daxoa);
        toastOpen("Đã xóa sản phẩm khỏi giỏ hàng!");
        $scope.updateGioHang();
        $timeout(function () {
          for (var i = 0; i < $scope.giohang_account.length; i++) {
            var item = $scope.giohang_account[i];
            var updateData = {
              id: item.id,
              id_account: item.id_account,
              img_items: item.img_items,
              title_items: item.title_items,
              price_items: item.price_items,
              count_items: item.count_items,
            };
            fetch("http://localhost:3000/giohang-items/" + item.id, {
              method: "PUT", // Hoặc 'PATCH' tùy thuộc vào yêu cầu của server
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updateData),
            })
              .then((response) => response.json())
              .then((data) => {
                console.log("Dữ liệu đã được cập nhật:", data);
              })
              .catch((error) => {
                console.error("Lỗi khi cập nhật dữ liệu:", error);
                // Xử lý khi có lỗi
              });
          }
          console.log("gio hang da xoa 2", $scope.giohang_daxoa);
          for (var i = 0; i < $scope.giohang_daxoa.length; i++) {
            var item = $scope.giohang_daxoa[i];
            fetch("http://localhost:3000/giohang-items/" + item.id, {
              method: "DELETE",
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
              })
              .then((data) => {
                console.log("Deleted successfully:", data);
              })
              .catch((error) => {
                console.error("Error during deletion:", error);
              });
          }
        }, 250);
      } else {
        return;
      }
    };
    $scope.updateGioHang = function () {
      var count_gio_hang = document.getElementById("count-giohang-all");
      count_gio_hang.textContent = $scope.giohang_account.length;
    };
    // controller cho register

    $scope.scopeNext = function () {
      var emaildefault = document.getElementById("email-focus").value;
      var emailOut = document.getElementById("email-output");
      var check = false;
      for (var i = 0; i < $scope.accountList.length; i++) {
        var user1 = $scope.accountList[i];
        if (user1.email === emaildefault) {
          check = true;
          break;
        }
      }
      if (check) {
        toastOpen("Email đã tồn tại, vui lòng nhập email khác");
        return;
      } else {
        emailOut.value = emaildefault;
        openTabRegister();
      }
    };
    $scope.register = function () {
      var email_user = document.getElementById("email-output").value;
      var name_user = document.getElementById("name-focus").value;
      var pass_user = document.getElementById("password-re").value;
      var date = document.getElementById("date-re").value;
      var moth = document.getElementById("month-re").value;
      var year = document.getElementById("year-re").value;
      var birthday_user = date + "/" + moth + "/" + year;
      var gender_user = document.getElementById("gender-re").value;
      $scope.newAccount = {
        email: email_user,
        name: name_user,
        password: pass_user,
        birthday: birthday_user,
        phone: "",
        gender: gender_user,
      };

      $http.post("http://localhost:3000/accountList", $scope.newAccount).then(
        function (res) {
          console.log(res.data);
        },
        function (res) {
          // khi tải thất bại
        }
      );

      modalOpen(1500);

      toastOpen("Đăng ký tài khoản thành công!");
      $timeout(function () {
        $location.path("/login");
      }, 1500);
    };
    // login
    $scope.login = function () {
      var email_log = document.getElementById("email-log").value;
      var password_log = document.getElementById("password-log").value;
      console.log(email_log);
      console.log(password_log);

      var check = false;
      modalOpen(1000);

      // Duyệt qua danh sách người dùng và kiểm tra đăng nhập
      for (var i = 0; i < $scope.accountList.length; i++) {
        var user1 = $scope.accountList[i];

        if (user1.email === email_log && user1.password === password_log) {
          // xử lý email, các thông tin của account
          var hiddenEmail = hideEmail(user1.email);
          var images = user1.img;
          console.log(images);

          if (images == "") {
            images = "user.png";
          }
          console.log(images);
          $scope.user = {
            id: user1.id,
            email: user1.email,
            name: user1.name,
            password: user1.password,
            birthday: user1.birthday,
            gender: user1.gender,
            islogin: true,
            img: images,
          };

          localStorage.setItem("user", JSON.stringify($scope.user));

          var birthdayString = user1.birthday;
          var parts = birthdayString.split("/");
          console.log("hidden Email: ", hiddenEmail);
          $scope.birthday = {
            dd: parts[0],
            mm: parts[1],
            yyyy: parts[2],
          };
          $scope.email_hidden = {
            email_hidden2: hiddenEmail,
          };
          // xử lý đổ list vào giỏ hàng dựa theo user1.id

          for (var i = 0; i < $scope.giohang_total.length; i++) {
            var user2 = $scope.giohang_total[i];
            if (user1.id === user2.id_account) {
              $scope.giohang_account.push({
                id: user2.id,
                id_account: user2.id_account,
                img_items: user2.img_items,
                title_items: user2.title_items,
                price_items: user2.price_items,
                count_items: user2.count_items,
              });
            }
          }

          check = true;
          break; // Dừng vòng lặp nếu tìm thấy người dùng hợp lệ
        }
      }
      if (check) {
        toastOpen("Đăng nhập thành công");

        $timeout(function () {
          $location.path("/home");
          $scope.updateGioHang();
        }, 1000);
      } else {
        toastOpen("Sai tài khoản hoặc mật khẩu!");
      }
    };
    $scope.logOut = function () {
      var confirmDelete = confirm("Bạn có chắc chắn muốn đăng xuất? ");
      if (confirmDelete) {
        $scope.giohang_account.splice(0, $scope.giohang_account.length);
        $scope.updateGioHang();
        localStorage.clear();

        toastOpen("Đăng xuất thành công!");
        modalOpen(1500);
        $timeout(function () {
          $location.path("/login"); // Điều này giả định rằng URL của trang login là '/login'
          $scope.user.islogin = false;
        }, 1500);
      } else {
        return;
      }
    };
    $scope.opentabGiohang = function () {
      $scope.giohang_update = [];
      var tabPanel = document.getElementById("tabpanel-giohang");
      var closeButton = document.getElementById("closeTab-giohang");

      if (tabPanel.classList.contains("active")) {
        tabPanel.classList.remove("active");
        closeButton.style.transform = "rotate(0deg)";
        console.log("opentab scope: ", $scope.giohang_account);

        $timeout(function () {
          for (var i = 0; i < $scope.giohang_account.length; i++) {
            var item = $scope.giohang_account[i];
            var updateData = {
              id: item.id,
              id_account: item.id_account,
              img_items: item.img_items,
              title_items: item.title_items,
              price_items: item.price_items,
              count_items: item.count_items,
            };
            fetch("http://localhost:3000/giohang-items/" + item.id, {
              method: "PUT", // Hoặc 'PATCH' tùy thuộc vào yêu cầu của server
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updateData),
            })
              .then((response) => response.json())
              .then((data) => {
                console.log("Dữ liệu đã được cập nhật:", data);
              })
              .catch((error) => {
                console.error("Lỗi khi cập nhật dữ liệu:", error);
                // Xử lý khi có lỗi
              });
          }
          console.log("gio hang da xoa 2", $scope.giohang_daxoa);
          for (var i = 0; i < $scope.giohang_daxoa.length; i++) {
            var item = $scope.giohang_daxoa[i];
            fetch("http://localhost:3000/giohang-items/" + item.id, {
              method: "DELETE",
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
              })
              .then((data) => {
                console.log("Deleted successfully:", data);
              })
              .catch((error) => {
                console.error("Error during deletion:", error);
              });
          }
        }, 250);
      } else {
        tabPanel.classList.add("active");
        tabPanel.style.width = "700px"; // Điều chỉnh độ rộng của tab pane tùy theo nhu cầu
        tabPanel.style.backgroundColor = "#fff5f5";

        document.addEventListener("keyup", function (event) {
          if (event.key === "Escape") {
            tabPanel.classList.remove("active");
            closeButton.style.transform = "rotate(0deg)";
            $timeout(function () {
              for (var i = 0; i < $scope.giohang_account.length; i++) {
                var item = $scope.giohang_account[i];
                var updateData = {
                  id: item.id,
                  id_account: item.id_account,
                  img_items: item.img_items,
                  title_items: item.title_items,
                  price_items: item.price_items,
                  count_items: item.count_items,
                };
                fetch("http://localhost:3000/giohang-items/" + item.id, {
                  method: "PUT", // Hoặc 'PATCH' tùy thuộc vào yêu cầu của server
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(updateData),
                })
                  .then((response) => response.json())
                  .then((data) => {
                    console.log("Dữ liệu đã được cập nhật:", data);
                  })
                  .catch((error) => {
                    console.error("Lỗi khi cập nhật dữ liệu:", error);
                    // Xử lý khi có lỗi
                  });
              }
              console.log("gio hang da xoa 2", $scope.giohang_daxoa);
              for (var i = 0; i < $scope.giohang_daxoa.length; i++) {
                var item = $scope.giohang_daxoa[i];
                fetch("http://localhost:3000/giohang-items/" + item.id, {
                  method: "DELETE",
                })
                  .then((response) => {
                    if (!response.ok) {
                      throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                  })
                  .then((data) => {
                    console.log("Deleted successfully:", data);
                  })
                  .catch((error) => {
                    console.error("Error during deletion:", error);
                  });
              }
            }, 250);
          }
        });

        closeButton.style.transform = "rotate(90deg)";
      }
      document
        .getElementById("closeTab-giohang")
        .addEventListener("click", function () {
          document
            .getElementById("tabpanel-giohang")
            .classList.remove("active");
          document.getElementById("closeTab-giohang").style.transform =
            "rotate(0deg)";
          openTab.style.removeProperty("background-color");
          openTab.style.removeProperty("color");
          $timeout(function () {
            for (var i = 0; i < $scope.giohang_account.length; i++) {
              var item = $scope.giohang_account[i];
              var updateData = {
                id: item.id,
                id_account: item.id_account,
                img_items: item.img_items,
                title_items: item.title_items,
                price_items: item.price_items,
                count_items: item.count_items,
              };
              fetch("http://localhost:3000/giohang-items/" + item.id, {
                method: "PUT", // Hoặc 'PATCH' tùy thuộc vào yêu cầu của server
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
              })
                .then((response) => response.json())
                .then((data) => {
                  console.log("Dữ liệu đã được cập nhật:", data);
                })
                .catch((error) => {
                  console.error("Lỗi khi cập nhật dữ liệu:", error);
                  // Xử lý khi có lỗi
                });
            }
            console.log("gio hang da xoa 2", $scope.giohang_daxoa);
            for (var i = 0; i < $scope.giohang_daxoa.length; i++) {
              var item = $scope.giohang_daxoa[i];
              fetch("http://localhost:3000/giohang-items/" + item.id, {
                method: "DELETE",
              })
                .then((response) => {
                  if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                  }
                  return response.json();
                })
                .then((data) => {
                  console.log("Deleted successfully:", data);
                })
                .catch((error) => {
                  console.error("Error during deletion:", error);
                });
            }
          }, 250);
        });
    };
    // search
    $scope.search = {
      keywords: "",
      isSearch: false,
    };
    $scope.searchByKeyWork = function () {
      $scope.find.length = 0;
      var giaTri = document.getElementById("inputKeyWord").value;
      $location.path("/search");
      $scope.search = {
        keywords: giaTri,
        isSearch: true,
      };
      for (var i = 0; i < $scope.products.length; i++) {
        var item = $scope.products[i];
        var search = $scope.search.keywords.toLowerCase(); // Chuyển đổi tất cả thành chữ thường để kiểm tra không phân biệt chữ hoa/chữ thường
        var title = item.title.toLowerCase();
        if (title.includes(search)) {
          $scope.find.push({
            img: item.img,
            title: item.title,
            price: item.price,
            likecount: item.likecount,
            sale: item.sale,
            id: item.id,
          });
        }
        console.log("find: ", $scope.find.length);
      }
      $scope.totalItems_find = $scope.find.length;
      $scope.begin_find = 0;
      $scope.pageSize_find = 12;
      $scope.pageCount_find = Math.ceil($scope.find.length / 12);
      console.log("pageCount_find: " + $scope.begin_find);

      $scope.next_find = function () {
        if ($scope.begin_find < ($scope.pageCount_find - 1) * 12) {
          $scope.begin_find += 12;
          console.log("next: " + $scope.begin_find);
          getCurrentPage_find();
          $scope.sapXep();
        }
      };
      $scope.prev_find = function () {
        if ($scope.begin_find > 0) {
          $scope.begin_find -= 12;
          getCurrentPage_find();
          $scope.sapXep();
        }
      };
      getCurrentPage_find = function () {
        $scope.tranghientai_find =
          Math.floor($scope.begin_find / $scope.pageSize_find) + 1;
        $scope.totalPages_find = Math.ceil(
          $scope.totalItems_find / $scope.pageSize_find
        );
        console.log("Tổng số trang: " + $scope.totalPages_find);
        console.log("trang hiện tại: " + $scope.tranghientai_find);
        console.log("item: " + $scope.totalItems_find);
      };
      console.log(getCurrentPage_find());
      $scope.sapXep();
    };
    $scope.sapXep = function () {
      var option = document.getElementById("selectedOption").value;
      if (option == 1) {
        $scope.find_select.price = 1; // sắp xếp nếu chọn giá giảm
      } else if (option == 2) {
        $scope.find_select.price = 2; // sắp xếp nếu chọn giá tăng
      } else {
        $scope.find_select.price = 0;
      }
    };
    // khi người dùng cuộn trang thì ghim title
    $scope.isSticky = false;
    angular.element($window).bind("scroll", function () {
      if ($window.pageYOffset >= 0) {
        $scope.isSticky = true;
        // Thêm border khi isSticky là true
      } else {
        $scope.isSticky = false;
        // Loại bỏ border khi isSticky là false
      }
      $scope.$apply();
    });
    //
    $scope.chiTietGH = function () {
      var tabPanel = document.getElementById("tabpanel-giohang");
      var closeButton = document.getElementById("closeTab-giohang");
      // post data khi ngừng click
      $timeout(function () {
        for (var i = 0; i < $scope.giohang_account.length; i++) {
          var item = $scope.giohang_account[i];
          var updateData = {
            id: item.id,
            id_account: item.id_account,
            img_items: item.img_items,
            title_items: item.title_items,
            price_items: item.price_items,
            count_items: item.count_items,
          };
          fetch("http://localhost:3000/giohang-items/" + item.id, {
            method: "PUT", // Hoặc 'PATCH' tùy thuộc vào yêu cầu của server
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log("Dữ liệu đã được cập nhật:", data);
            })
            .catch((error) => {
              console.error("Lỗi khi cập nhật dữ liệu:", error);
              // Xử lý khi có lỗi
            });
        }
        console.log("gio hang da xoa 2", $scope.giohang_daxoa);
        for (var i = 0; i < $scope.giohang_daxoa.length; i++) {
          var item = $scope.giohang_daxoa[i];
          fetch("http://localhost:3000/giohang-items/" + item.id, {
            method: "DELETE",
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              return response.json();
            })
            .then((data) => {
              console.log("Deleted successfully:", data);
            })
            .catch((error) => {
              console.error("Error during deletion:", error);
            });
        }
      }, 250);
      tabPanel.classList.remove("active");
      closeButton.style.transform = "rotate(0deg)";
      $location.path("/info-giohang");
    };
  },
  // sự kiện mở giỏ hàng
]);
app.config(function ($routeProvider) {
  $routeProvider
    .when("/home", {
      templateUrl: "home.html",
    })
    .when("/register", {
      templateUrl: "register.html",
    })
    .when("/login", {
      templateUrl: "login.html",
    })
    .when("/account", {
      templateUrl: "account.html",
    })
    .when("/search", {
      templateUrl: "layout/index-searchItems.html",
    })
    .when("/info-giohang", {
      templateUrl: "info-giohang.html",
    })
    .otherwise({ redirectTo: "home" });
});
app.filter("myFilter", function () {
  return function (input) {
    input = "a";
    console.log(input);
  };
});

//---------------------------------------------------------------
// AJAX POST
function postData(data, host) {
  var xhr = new XMLHttpRequest();

  xhr.open("POST", host, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 201) {
      // Xử lý dữ liệu khi POST thành công
      console.log("POST success");

      // Sau khi POST thành công, bạn có thể gọi fetchData để lấy dữ liệu mới
    }
  };

  xhr.send(JSON.stringify(data));
}
// nhận dữ liệu
function fetchData(host, callback) {
  fetch(host)
    .then((response) => response.json())
    .then((data) => {
      // Gọi hàm callback để xử lý dữ liệu mới và cập nhật $scope
      callback(data);
    })
    .catch((error) => {
      // Xử lý lỗi
      console.error("Error:", error);
    });
}

//chuyển hóa email
function hideEmail(email) {
  // Tách phần username và domain
  var parts = email.split("@");
  // Lấy phần username
  var username = parts[0];

  // Lấy phần domain
  var domain = parts[1];

  // Chuyển đổi phần username
  var hiddenUsername =
    username.substring(0, Math.min(username.length, 4)) +
    "*".repeat(Math.max(username.length - 4, 0));

  // Kết hợp phần username đã chuyển đổi và phần domain
  var hiddenEmail = hiddenUsername + "@" + domain;

  return hiddenEmail;
}
// register form

function openTabRegister() {
  // hàm mở tabPanel register
  var tabPanel = document.getElementById("tabPanel-Register");
  var closeButton = document.getElementById("closeTab-register");
  var inputField = document.getElementById("name-focus"); // Lấy đối tượng input

  if (tabPanel.classList.contains("active")) {
    tabPanel.classList.remove("active");
    closeButton.style.transform = "rotate(0deg)";
    inputField.focus();
  } else {
    tabPanel.classList.add("active");
    tabPanel.style.width = "100%"; // Điều chỉnh độ rộng của tab pane tùy theo nhu cầu
    tabPanel.style.height = "1000px";
    tabPanel.style.backgroundColor = "#181a20";
    closeButton.style.transform = "rotate(90deg)";
    inputField.focus();
  }

  document
    .getElementById("closeTab-register") // click vào nút tắt tabPanel register
    .addEventListener("click", function () {
      var focusEmail = document.getElementById("email-focus"); // Lấy đối tượng input
      document.getElementById("tabPanel-Register").classList.remove("active");
      document.getElementById("closeTab-register").style.transform =
        "rotate(0deg)";
      focusEmail.focus();
    });

  //hàm đóng cửa sổ bằng phím esc
  document.addEventListener("keyup", function (event) {
    if (event.key === "Escape") {
      var tabPanel = document.getElementById("tabPanel-Register");
      var closeButton = document.getElementById("closeTab-register");
      tabPanel.classList.remove("active");
      closeButton.style.transform = "rotate(0deg)";
    }
  });
}
// click vào biểu tượng show pass
function showPass_re(idInput, idwhow) {
  var passwordField = document.getElementById(idInput);
  var toggleIcon = document.getElementById(idwhow);

  if (passwordField.type === "password") {
    passwordField.type = "text";
    toggleIcon.classList.remove("bi-eye-slash");
    toggleIcon.classList.add("bi-eye");
  } else {
    passwordField.type = "password";
    toggleIcon.classList.remove("bi-eye");
    toggleIcon.classList.add("bi-eye-slash");
  }
}
// index form
function openTabitems() {
  var tabPanel2 = document.getElementById("tabPanel-items");
  var closeButton2 = document.getElementById("closeTab-chitieiSP");
  if (tabPanel2 && closeButton2) {
    if (tabPanel2.classList.contains("active")) {
      tabPanel2.classList.remove("active");
      closeButton2.style.transform = "rotate(0deg)";
    } else {
      tabPanel2.classList.add("active");
      tabPanel2.style.width = "100%";
      tabPanel2.style.height = "100%";
      closeButton2.style.transform = "rotate(90deg)";
    }
  }
  document.addEventListener("keyup", function (event) {
    if (event.key === "Escape") {
      tabPanel2.classList.remove("active");
      closeButton2.style.transform = "rotate(0deg)";
    }
  });

  closeButton2.style.transform = "rotate(90deg)";
  document
    .getElementById("closeTab-chitieiSP")
    .addEventListener("click", function () {
      tabPanel2.classList.remove("active");
      closeButton2.style.transform = "rotate(0deg)";
    });
}

//set thông tin lên table
function setAttributeItems(img, title, price) {
  var inputcount = document.getElementById("count-input");
  inputcount.value = 1;

  console.log("link img: " + img);
  console.log("title: " + title);
  console.log("price: " + price);
  var tabPanel_img = document.getElementsByClassName("tabpanel-img");
  var tabPanel_title = document.getElementsByClassName("tabpanel-title");
  var tabPanel_price = document.getElementsByClassName("tabpanel-price");
  for (var i = 0; i < tabPanel_img.length; i++) {
    tabPanel_img[i].setAttribute("src", "images/" + img);
  }
  for (var i = 0; i < tabPanel_title.length; i++) {
    tabPanel_title[i].textContent = title;
  }
  for (var i = 0; i < tabPanel_price.length; i++) {
    tabPanel_price[i].textContent = price + ".000";
  }
}

// sự kiện bắt lỗi người dùng nhập quá số lượng
function validateNumberInput(input) {
  var countMaxElement = document.getElementById("max-sp");
  var countMax = parseInt(countMaxElement.textContent);
  input.value = input.value.replace(/[^0-9]/g, "");
  var inputValue = parseInt(input.value, 10);
  if (isNaN(inputValue) || inputValue < 0) {
    input.value = "";
  } else if (inputValue > countMax) {
    input.value = countMax;
  }
}

// modal
function modalOpen(timeout) {
  var modalElement = document.getElementById("exampleModal");
  var modal = new bootstrap.Modal(modalElement, {});

  // Sự kiện khi bắt đầu ẩn modal
  modalElement.addEventListener("hide.bs.modal", function () {
    modalElement.classList.remove("show-animation");
    modalElement.classList.add("hide-animation");
  });

  modal.show();

  // Đặt thời gian timeout để ẩn modal sau khoảng thời gian truyền vào
  setTimeout(function () {
    modal.hide();
  }, timeout);
}

// random code
function generateRandomCode() {
  var length = 7;
  var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var randomCode = "";

  for (var i = 0; i < length; i++) {
    var randomIndex = Math.floor(Math.random() * charset.length);
    randomCode += charset[randomIndex];
  }

  return randomCode;
}
//send email
function sendEmail(nguoiNhan) {
  (function () {
    emailjs.init("nbnYt4w06y1d2as_U"); // public key
  })();
  var randomCode = generateRandomCode();
  console.log(randomCode);
  var params = {
    name: "Binance",
    to: nguoiNhan,
    subject: "Xác nhận email",
    replyto: "noreply@gmail.com",
    content: "Mã xác nhận thay đổi thông tin của bạn là:"+randomCode,
  };
  var serviceID = "service_q5343j2";
  var templateID = "template_0vfh7me";
  emailjs
    .send(serviceID, templateID, params)
    .then((res) => {
      alert("Đã gửi mail");
    })
    .catch();
}
// toast
function toastOpen(content) {
  var toastLiveExample = document.getElementById("liveToast");

  if (toastLiveExample) {
    var toastBootstrap = new bootstrap.Toast(toastLiveExample, {
      animation: true,
      autohide: true,
      delay: 5000,
    });

    var contentToast = document.getElementById("toast-content");
    contentToast.textContent = content;

    // Hiển thị toast và xóa lớp 'hide'
    toastLiveExample.classList.remove("hide");
    toastBootstrap.show();
  }
}

// thêm giỏ hàng

//sự kiện click nút giỏ hàng
function tangSL() {
  var count = document.getElementById("count-input");
  var max = document.getElementById("max-sp");
  var max_int = parseInt(max.textContent);
  var dem = parseInt(count.value);
  if (dem < max_int) count.value = dem += 1;
  else {
    count.value = max_int;
    toastOpen("Đã hết số lượng của sản phẩm");
  }
}
function giamSL() {
  var count = document.getElementById("count-input");
  var max = document.getElementById("max-sp");
  var max_int = parseInt(max.textContent);
  var dem = parseInt(count.value);
  if (dem > 1) count.value = dem -= 1;
  else {
    count.value = 1;
    toastOpen("Giới hạn sản phẩm là 1");
  }
}
app.filter("myCurrency", function () {
  return function (input) {
    // Kiểm tra xem input có phải là số không
    if (!isNaN(input)) {
      // Chuyển đổi số tiền thành chuỗi
      var currencyString = input.toString();

      // Loại bỏ chữ đô la ở đầu chuỗi

      // Loại bỏ các chữ số thập phân không cần thiết (.00)
      if (currencyString.includes(".")) {
        currencyString = currencyString.split(".")[0];
      }

      // Định dạng số tiền theo dấu phẩy mỗi ba số
      currencyString = currencyString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      // Thêm dấu ,000 vào sau khi đã định dạng
      currencyString += ",000";

      return currencyString;
    }
    // Nếu input không phải là số, trả về input ban đầu
    return input;
  };
});
