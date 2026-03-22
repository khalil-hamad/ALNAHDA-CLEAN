const currency = "₺";

// رقم واتساب المحدث
const WHATSAPP_NUMBER = "963947760414";

// متغيرات عامة
let currentUser = localStorage.getItem("currentUser");
let usersData = JSON.parse(localStorage.getItem("usersData")) || {};
let cart = [];
let ordersHistory = [];

// عداد الطلبات
let ordersCount = parseInt(localStorage.getItem("ordersCount")) || 0;

// كلمة مرور المدير
const ADMIN_PASSWORD = "admin123";

// =============== الحصول على المنتجات ===============
function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || getDefaultProducts();
}

function getDefaultProducts() {
  return [
    { name: "صابون سائل", price: 35, boxPrice: null, img: "img/صابون سائل.png", category: "منظفات", available: true },
    { name: "سائل جلي", price: 12, boxPrice: null, img: "img/سائل جلي.png", category: "منظفات", available: true },
    { name: "معطر جو", price: 25, boxPrice: null, img: "img/معطر.png", category: "معطرات", available: false },
    { name: "دواء غسيل اوتوماتيك", price: 48, boxPrice: null, img: "img/توماتيك.png", category: "منظفات", available: true },
    { name: "دواء غسيل عادي", price: 45, boxPrice: null, img: "img/عادي.png", category: "منظفات", available: true },
    { name: "كلور", price: 12, boxPrice: null, img: "img/كلور.png", category: "منظفات", available: true },
    { name: "شامبو بالعسل", price: 110, boxPrice: null, img: "img/شامبو عسل.png", category: "شامبو", available: false },
    { name: "عملاق", price: 55, boxPrice: null, img: "img/عملاق.png", category: "منظفات", available: true },
    { name: "فلاش", price: 25, boxPrice: null, img: "img/فلاش.png", category: "منظفات", available: true },
    { name: "دواء غسيل سائل", price: 40, boxPrice: 35, img: "img/غسيل سائل.png", category: "منظفات", available: true }
  ];
}

// =============== التحقق من المدير ===============
function openAdminPanel() {
  const password = prompt("🔐 أدخل كلمة مرور المدير:");
  if (password === ADMIN_PASSWORD) {
    window.location.href = "admin.html";
  } else if (password !== null) {
    showNotification("❌ كلمة المرور غير صحيحة", "error");
  }
}

// =============== التهيئة ===============
document.addEventListener('DOMContentLoaded', function() {
  // تهيئة المنتجات إذا لم تكن موجودة
  if (!localStorage.getItem("products")) {
    localStorage.setItem("products", JSON.stringify(getDefaultProducts()));
  }
  
  if (currentUser && usersData[currentUser]) {
    showMainSite();
  } else {
    showLoginScreen();
  }
  
  updateOrdersCounter();
});

// =============== عداد الطلبات ===============
function updateOrdersCounter() {
  const counterElement = document.getElementById('ordersCount');
  if (counterElement) {
    counterElement.innerText = ordersCount.toString().padStart(2, '0');
  }
}

function incrementOrdersCounter() {
  ordersCount++;
  localStorage.setItem("ordersCount", ordersCount);
  updateOrdersCounter();
}

// =============== نظام تسجيل الدخول ===============
function showLoginScreen() {
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("mainSite").style.display = "none";
}

function showMainSite() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("mainSite").style.display = "block";
  
  // عرض عنوان المستخدم
  if (currentUser && usersData[currentUser] && usersData[currentUser].profile) {
    let profile = usersData[currentUser].profile;
    document.getElementById("userAddress").innerText = `${profile.district}`;
  }
  
  // إظهار زر المدير (اختياري)
   document.getElementById("adminBtn").style.display = "flex";
  
  loadUserData();
  displayProducts();
  renderCart();
  renderOrders();
  
  setTimeout(() => {
    showNotification('👋 أهلاً بك في معمل النهضة', 'info', 3000);
  }, 1000);
}

function loadUserData() {
  if (currentUser && usersData[currentUser]) {
    cart = usersData[currentUser].cart || [];
    ordersHistory = usersData[currentUser].orders || [];
  } else {
    cart = [];
    ordersHistory = [];
  }
}

function saveUserData() {
  if (currentUser) {
    if (!usersData[currentUser]) {
      usersData[currentUser] = {
        profile: {},
        orders: [],
        cart: []
      };
    }
    usersData[currentUser].cart = cart;
    usersData[currentUser].orders = ordersHistory;
    localStorage.setItem('usersData', JSON.stringify(usersData));
  }
}

function saveClientData() {
  let district = document.getElementById("district").value;
  let street = document.getElementById("street").value.trim();
  let home = document.getElementById("home").value.trim();
  let building = document.getElementById("building").value;

  // إذا تم اختيار بناية، نستخدمها بدلاً من الحارة
  if (building && building !== "") {
    street = `بناية ${building}`;
  }

  if (!district || !street || !home) {
    showNotification("❌ يرجى إدخال جميع البيانات", "error");
    return;
  }

  let userId = `${district}_${street}_${home}`;
  
  if (!usersData[userId]) {
    usersData[userId] = {
      profile: { district, street, home, building: building || null },
      orders: [],
      cart: [],
      joinDate: new Date().toLocaleDateString("ar-EG")
    };
  } else {
    usersData[userId].profile = { district, street, home, building: building || null };
  }
  
  currentUser = userId;
  localStorage.setItem("currentUser", currentUser);
  localStorage.setItem("usersData", JSON.stringify(usersData));
  
  showNotification(`👋 مرحباً بك`, "success");
  showMainSite();
}

function logout() {
  if (!confirm("👋 هل تريد تسجيل الخروج؟")) return;
  localStorage.removeItem("currentUser");
  currentUser = null;
  showLoginScreen();
  showNotification("🚪 تم تسجيل الخروج", "info");
}

function showFullAddress() {
  if (currentUser && usersData[currentUser] && usersData[currentUser].profile) {
    let profile = usersData[currentUser].profile;
    showNotification(`📍 ${profile.district} - حارة ${profile.street} - بيت ${profile.home}`, "info");
  }
}

// =============== نظام الإشعارات ===============
function showNotification(message, type = 'info', duration = 5000) {
  const area = document.getElementById('notificationArea');
  if (!area) return;
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  
  notification.innerHTML = `
    <i class="fas ${icons[type] || 'fa-info-circle'}"></i>
    <div class="notification-content">
      <div class="notification-title">${type === 'success' ? 'تم بنجاح' : 
                                       type === 'error' ? 'خطأ' : 
                                       type === 'warning' ? 'تنبيه' : 'تنبيه'}</div>
      <div class="notification-message">${message}</div>
    </div>
    <button class="notification-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  area.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentElement) notification.remove();
  }, duration);
}

// =============== عرض المنتجات ===============
function displayProducts() {
  const container = document.getElementById("products");
  if (!container) return;
  
  const products = getProducts();
  container.innerHTML = "";
  
  products.forEach((p, i) => {
    const isAvailable = p.available !== false;
    const hasBoxPrice = p.boxPrice !== null && p.boxPrice > 0;
    
    container.innerHTML += `
      <div class="card" data-category="${p.category}">
        <img src="${p.img}" alt="${p.name}" loading="lazy" onclick="openImageModalByIndex(${i})" style="cursor:pointer;" onerror="this.src='https://via.placeholder.com/300x200?text=${encodeURIComponent(p.name)}'">
        <div class="card-body">
          <h3>${p.name}</h3>
          <div class="price">💰 ${p.price} ${currency} / كيلو${hasBoxPrice ? `<br>📦 ${p.boxPrice} ${currency} / عبوة` : ''}</div>
          ${isAvailable ? `
            <select id="type${i}" class="product-select" onchange="toggleQuantityInput(${i}, this.value)">
              <option value="kg">⚖️ كيلو</option>
              <option value="money">💵 مبلغ</option>
              ${hasBoxPrice ? '<option value="box">📦 عبوة</option>' : ''}
            </select>
            <input type="number" id="qty${i}" placeholder="${hasBoxPrice ? 'الكمية (كيلو/مبلغ/عبوة)' : 'الكمية'}" min="0.1" step="0.1" inputmode="decimal">
            <button onclick="addToCart(${i})">
              <i class="fas fa-cart-plus"></i>
              إضافة
            </button>
          ` : `
            <button disabled style="background:#ccc;">
              <i class="fas fa-times-circle"></i>
              غير متوفر
            </button>
          `}
        </div>
      </div>`;
  });
}

function toggleQuantityInput(index, type) {
  const qtyInput = document.getElementById(`qty${index}`);
  const products = getProducts();
  const product = products[index];
  
  if (type === "box" && product.boxPrice) {
    qtyInput.placeholder = "عدد العبوات";
    qtyInput.step = "1";
    qtyInput.min = "1";
  } else if (type === "kg") {
    qtyInput.placeholder = "الكمية (كيلو)";
    qtyInput.step = "0.1";
    qtyInput.min = "0.1";
  } else if (type === "money") {
    qtyInput.placeholder = "المبلغ (₺)";
    qtyInput.step = "0.1";
    qtyInput.min = "0.1";
  }
}

function addToCart(i) {
  const products = getProducts();
  
  if (products[i].available === false) {
    showNotification("❌ هذا المنتج غير متوفر حالياً", "error");
    return;
  }
  
  let type = document.getElementById(`type${i}`).value;
  let qty = parseFloat(document.getElementById(`qty${i}`).value);
  
  if (!qty || qty <= 0) {
    showNotification("❌ أدخل كمية صحيحة", "error");
    return;
  }

  let product = products[i];
  let kg = 0;
  let total = 0;
  let unit = "كغ";
  
  if (type === "kg") {
    kg = qty;
    total = kg * product.price;
    unit = "كغ";
  } else if (type === "money") {
    kg = qty / product.price;
    total = qty;
    unit = "₺";
  } else if (type === "box" && product.boxPrice) {
    kg = qty;
    total = qty * product.boxPrice;
    unit = "علبة";
  }

  cart.push({ 
    name: product.name, 
    kg: kg.toFixed(2), 
    total: total.toFixed(2),
    price: type === "box" ? product.boxPrice : product.price,
    unit: unit,
    type: type
  });
  
  saveUserData();
  renderCart();
  showNotification(`✅ تمت إضافة ${product.name}`, "success");
  
  let floatingCart = document.querySelector('.floating-cart');
  if (floatingCart) {
    floatingCart.style.transform = 'scale(1.2)';
    setTimeout(() => {
      floatingCart.style.transform = 'scale(1)';
    }, 200);
  }
}

// =============== إدارة السلة ===============
function renderCart() {
  let items = document.getElementById("cartItems");
  if (!items) return;
  
  let total = 0;
  items.innerHTML = "";
  
  let user = usersData[currentUser]?.profile;
  if (user) {
    items.innerHTML += `
      <div class="cart-user">
        <i class="fas fa-map-marker-alt"></i> 📍 العنوان: ${user.district} - حارة ${user.street} - بيت ${user.home}
      </div>`;
  }

  if (cart.length === 0) {
    items.innerHTML += '<p style="text-align:center; color:#888; padding:20px;">🛒 السلة فارغة</p>';
  } else {
    cart.forEach((item, index) => {
      total += parseFloat(item.total);
      items.innerHTML += `
        <div class="cart-item">
          <div>
            <b>${item.name}</b><br>
            <small>${item.kg} ${item.unit === "علبة" ? "علبة" : "كغ"}</small>
          </div>
          <div>
            <strong>${item.total} ${currency}</strong>
            <button onclick="removeFromCart(${index})" style="width:32px; height:32px; border-radius:50%; background:#ef476f; color:white; border:none; margin-right:5px;">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>`;
    });
  }

  let totalElement = document.getElementById("totalPrice");
  if (totalElement) {
    totalElement.innerHTML = `💰 الإجمالي: ${total.toFixed(2)} ${currency}`;
  }
  
  let floatingCount = document.getElementById("floatingCount");
  if (floatingCount) {
    floatingCount.innerText = cart.length;
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveUserData();
  renderCart();
  showNotification("🗑️ تم حذف المنتج", "info");
}

function clearCart() {
  if (cart.length === 0) {
    showNotification("السلة فارغة", "info");
    return;
  }
  if (!confirm("❓ هل تريد تفريغ السلة؟")) return;
  
  cart = [];
  saveUserData();
  renderCart();
  showNotification("🗑️ تم تفريغ السلة", "info");
}

function toggleCart() {
  let cartElement = document.getElementById("cart");
  let ordersElement = document.getElementById("orders");
  
  cartElement.classList.toggle("active");
  ordersElement.classList.remove("active");
}

// =============== إدارة الطلبات ===============
function toggleOrders() {
  let ordersElement = document.getElementById("orders");
  let cartElement = document.getElementById("cart");
  
  ordersElement.classList.toggle("active");
  cartElement.classList.remove("active");
  renderOrders();
}

function renderOrders() {
  let box = document.getElementById("ordersList");
  if (!box) return;
  
  box.innerHTML = "";
  
  if (!ordersHistory || ordersHistory.length === 0) {
    box.innerHTML = '<p style="text-align:center; color:#888; padding:20px;">📭 لا توجد طلبات سابقة</p>';
    return;
  }
  
  // زر مسح الكل
  box.innerHTML += `
    <button class="clear-orders-btn" onclick="clearAllOrders()">
      <i class="fas fa-trash"></i> مسح جميع الطلبات (${ordersHistory.length})
    </button>
  `;
  
  ordersHistory.slice(0, 20).forEach((order, index) => {
    box.innerHTML += `
      <div class="order-item">
        <div style="display:flex; justify-content:space-between; align-items:start;">
          <b>📍 ${order.address || 'عنوان غير محدد'}</b>
          <button onclick="deleteOrder(${index})" style="background:none; border:none; color:#ef476f; font-size:18px; width:auto; padding:5px;">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <small>🕒 ${order.date}</small>
        <div style="background:#f0f0f0; padding:8px; border-radius:8px; margin:8px 0; font-size:12px;">
          ${order.items.slice(0, 3).join("<br>")}
          ${order.items.length > 3 ? `<br>... و${order.items.length - 3} أخرى` : ''}
        </div>
        <b>💰 ${order.total} ${currency}</b>
      </div>`;
  });
}

function deleteOrder(index) {
  if (!confirm("هل تريد حذف هذا الطلب؟")) return;
  
  ordersHistory.splice(index, 1);
  saveUserData();
  renderOrders();
  showNotification("🗑️ تم حذف الطلب", "info");
}

function clearAllOrders() {
  if (!ordersHistory || ordersHistory.length === 0) {
    showNotification("لا توجد طلبات", "info");
    return;
  }
  
  if (!confirm("⚠️ هل أنت متأكد من مسح جميع الطلبات؟")) return;
  
  ordersHistory = [];
  saveUserData();
  renderOrders();
  showNotification("🗑️ تم مسح جميع الطلبات", "info");
}

// =============== واتساب للطلبات ===============
function sendWhatsApp() {
  if (cart.length === 0) {
    showNotification("❌ السلة فارغة", "error");
    return;
  }

  let now = new Date();
  let date = now.toLocaleString("ar-EG");
  let user = usersData[currentUser]?.profile;

  if (!user) {
    showNotification("❌ بيانات العنوان غير موجودة", "error");
    return;
  }

  let address = `${user.district} - حارة ${user.street} - بيت ${user.home}`;
  let total = cart.reduce((s, i) => s + parseFloat(i.total), 0).toFixed(2);

  let order = {
    address: address,
    date: date,
    items: cart.map(i => `• ${i.name} - ${i.kg} ${i.unit === "علبة" ? "علبة" : "كغ"} - ${i.total} ${currency}`),
    total: total
  };

  // حفظ الطلب في سجل العميل
  ordersHistory.unshift(order);
  saveUserData();

  // زيادة عداد الطلبات
  incrementOrdersCounter();

  // رسالة واتساب
  let msg = `🛍️ *طلب جديد*\n\n`;
  msg += `📍 *العنوان:* ${address}\n`;
  msg += `──────────────\n`;
  msg += `*🛒 الطلب:*\n`;
  order.items.forEach(i => msg += i + "\n");
  msg += `──────────────\n`;
  msg += `💰 *الإجمالي:* ${total} ${currency}\n`;
  msg += `🕒 *التاريخ:* ${date}\n`;
  msg += `──────────────\n`;
  msg += `✅ شكراً لتسوقك من معمل النهضة`;

  // فتح واتساب
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=` + encodeURIComponent(msg), '_blank');

  // مسح السلة بعد إرسال الطلب
  cart = [];
  saveUserData();
  renderCart();
  
  showNotification("📤 تم إرسال الطلب", "success");
}

// =============== واتساب للملاحظات ===============
function sendNoteToWhatsApp() {
  let note = document.getElementById("userNote").value.trim();
  let noteType = document.getElementById("noteType").value;
  
  if (!note) {
    showNotification("❌ اكتب ملاحظاتك أولاً", "error");
    return;
  }

  let user = usersData[currentUser]?.profile;
  let date = new Date().toLocaleString("ar-EG");
  
  const typeNames = {
    suggestion: '💡 اقتراح',
    complaint: '⚠️ شكوى',
    inquiry: '❓ استفسار',
    praise: '🌟 إشادة'
  };

  let msg = `📝 *${typeNames[noteType]} من عميل*\n\n`;
  if (user) {
    msg += `📍 *العنوان:* ${user.district} - ${user.street} - ${user.home}\n`;
  }
  msg += `🕒 *التاريخ:* ${date}\n`;
  msg += `──────────────\n`;
  msg += `*💬 الملاحظة:*\n`;
  msg += `${note}\n`;
  msg += `──────────────\n`;
  msg += `✅ شكراً لتواصلك معنا`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=` + encodeURIComponent(msg), '_blank');
  
  // تفريغ حقل الملاحظات بعد الإرسال
  document.getElementById("userNote").value = "";
  showNotification("📤 تم إرسال ملاحظاتك", "success");
}

// =============== نظام معاينة الصور ===============
let currentImageIndex = 0;
let productImages = [];

function collectProductImages() {
  productImages = [];
  const products = getProducts();
  products.forEach((product, index) => {
    productImages.push({
      src: product.img,
      alt: product.name,
      index: index
    });
  });
}

function openImageModalByIndex(index) {
  collectProductImages();
  currentImageIndex = index;
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const caption = document.getElementById('modalCaption');
  
  if (productImages[index]) {
    modalImg.src = productImages[index].src;
    caption.innerHTML = productImages[index].alt;
  }
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeImageModal() {
  const modal = document.getElementById('imageModal');
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function navigateImage(direction) {
  currentImageIndex += direction;
  
  if (currentImageIndex < 0) {
    currentImageIndex = productImages.length - 1;
  } else if (currentImageIndex >= productImages.length) {
    currentImageIndex = 0;
  }
  
  const modalImg = document.getElementById('modalImage');
  const caption = document.getElementById('modalCaption');
  
  if (productImages[currentImageIndex]) {
    modalImg.src = productImages[currentImageIndex].src;
    caption.innerHTML = productImages[currentImageIndex].alt;
  }
}

function downloadCurrentImage() {
  const modalImg = document.getElementById('modalImage');
  const link = document.createElement('a');
  link.href = modalImg.src;
  link.download = `product_${currentImageIndex + 1}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showNotification('✅ جاري تحميل الصورة', 'success');
}

// إضافة أزرار التنقل
function addNavigationButtons() {
  const modal = document.getElementById('imageModal');
  
  const prevBtn = document.createElement('button');
  prevBtn.className = 'nav-btn prev-btn';
  prevBtn.innerHTML = '❮';
  prevBtn.onclick = (e) => {
    e.stopPropagation();
    navigateImage(-1);
  };
  
  const nextBtn = document.createElement('button');
  nextBtn.className = 'nav-btn next-btn';
  nextBtn.innerHTML = '❯';
  nextBtn.onclick = (e) => {
    e.stopPropagation();
    navigateImage(1);
  };
  
  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'download-image';
  downloadBtn.innerHTML = '<i class="fas fa-download"></i> تحميل الصورة';
  downloadBtn.onclick = (e) => {
    e.stopPropagation();
    downloadCurrentImage();
  };
  
  modal.appendChild(prevBtn);
  modal.appendChild(nextBtn);
  modal.appendChild(downloadBtn);
}

// إضافة دعم لوحة المفاتيح
document.addEventListener('keydown', function(e) {
  const modal = document.getElementById('imageModal');
  if (!modal.classList.contains('active')) return;
  
  if (e.key === 'Escape') {
    closeImageModal();
  } else if (e.key === 'ArrowLeft') {
    navigateImage(-1);
  } else if (e.key === 'ArrowRight') {
    navigateImage(1);
  }
});

// تهيئة معاينة الصور
setTimeout(() => {
  collectProductImages();
  addNavigationButtons();
}, 1000);

function toggleBuildingInput() {
  const district = document.getElementById("district").value;
  const buildingSelect = document.getElementById("building");
  const streetInput = document.getElementById("street");
  const homeInput = document.getElementById("home");
  
  // فقط حي النهضة يظهر له خانة البناية
  if (district === "النهضة") {
    buildingSelect.style.display = "block";
    
    // إضافة مستمع لحدث تغيير البناية
    buildingSelect.onchange = function() {
      if (buildingSelect.value !== "") {
        // عند اختيار بناية، يتم إخفاء حقل الحارة
        streetInput.style.display = "none";
        streetInput.value = ""; // تفريغ القيمة
        homeInput.placeholder = "رقم البيت (داخل البناية)";
      } else {
        // عند إلغاء اختيار البناية، يظهر حقل الحارة
        streetInput.style.display = "block";
        streetInput.placeholder = "رقم الحارة";
        homeInput.placeholder = "رقم البيت";
      }
    };
    
  } else {
    buildingSelect.style.display = "none";
    buildingSelect.value = ""; // تفريغ القيمة
    streetInput.style.display = "block";
    streetInput.placeholder = "رقم الحارة";
    homeInput.placeholder = "رقم البيت";
  }
}
// دالة لإظهار الرسالة المنبثقة
function showToast(message, type = "info") {
  let toast = document.getElementById("toast");
  if (!toast) return;
  
  toast.innerText = message;
  toast.style.opacity = "1";
  toast.style.bottom = "100px";
  
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.bottom = "80px";
  }, 2000);
}
// تهيئة الحقول عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  const buildingSelect = document.getElementById("building");
  const streetInput = document.getElementById("street");
  const homeInput = document.getElementById("home");
  const districtSelect = document.getElementById("district");
  
  // إضافة حدث لمراقبة تغيير البناية
  if (buildingSelect) {
    buildingSelect.addEventListener('change', function() {
      if (this.value !== "") {
        streetInput.style.display = "none";
        streetInput.value = "";
        homeInput.placeholder = "رقم البيت (داخل البناية)";
      } else {
        streetInput.style.display = "block";
        streetInput.placeholder = "رقم الحارة";
        homeInput.placeholder = "رقم البيت";
      }
    });
  }
  
  // إضافة حدث لمراقبة تغيير الحي
  if (districtSelect) {
    districtSelect.addEventListener('change', function() {
      if (this.value === "النهضة") {
        buildingSelect.style.display = "block";
      } else {
        buildingSelect.style.display = "none";
        buildingSelect.value = "";
        streetInput.style.display = "block";
        streetInput.placeholder = "رقم الحارة";
        homeInput.placeholder = "رقم البيت";
      }
    });
  }
});
// =============== دوال التعديل في script.js ===============

// تحديث عرض المنتجات بعد التعديل من المدير
function refreshProductsDisplay() {
  displayProducts();
  collectProductImages();
}

// دالة لإعادة تحميل المنتجات عند العودة من المدير
window.addEventListener('storage', function(e) {
  if (e.key === 'products') {
    refreshProductsDisplay();
  }
});
// =============== دعم الصور Base64 ===============

// دالة للتحقق إذا كانت الصورة Base64
function isBase64Image(str) {
  return str && str.startsWith('data:image');
  // تهيئة معاينة الصور
setTimeout(() => {
  collectProductImages();
  addNavigationButtons();
}, 1000);

// دالة لإظهار الرسالة المنبثقة
function showToast(message, type = "info") {
  let toast = document.getElementById("toast");
  if (!toast) return;
  
  toast.innerText = message;
  toast.style.opacity = "1";
  toast.style.bottom = "100px";
  
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.bottom = "80px";
  }, 2000);
}

// =============== تحديث المنتجات للمستخدمين مباشرة ===============

// دالة لتحديث عرض المنتجات للمستخدم الحالي
function refreshUserProducts() {
  if (document.getElementById("mainSite").style.display === "block") {
    displayProducts();
    collectProductImages();
    showNotification("🔄 تم تحديث قائمة المنتجات", "info", 2000);
  }
}

// الاستماع للتغييرات في localStorage (عند تعديل المنتجات من المدير)
window.addEventListener('storage', function(e) {
  if (e.key === 'products') {
    refreshUserProducts();
    updateCartAfterProductChange();
  }
});

// دالة لتحديث السلة بعد تغيير المنتجات
function updateCartAfterProductChange() {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  let cartChanged = false;
  
  for (let i = cart.length - 1; i >= 0; i--) {
    const cartItem = cart[i];
    const productExists = products.find(p => p.name === cartItem.name);
    if (!productExists || productExists.available === false) {
      cart.splice(i, 1);
      cartChanged = true;
      if (productExists && productExists.available === false) {
        showNotification(`⚠️ تم إزالة "${cartItem.name}" من السلة لأنه غير متوفر حالياً`, "warning");
      }
    }
  }
  
  if (cartChanged) {
    saveUserData();
    renderCart();
  }
}

// حفظ المنتجات القديمة عند التحميل
window._oldProducts = JSON.parse(JSON.stringify(JSON.parse(localStorage.getItem("products")) || []));
}

// دالة لتحديث عرض المنتجات مع دعم Base64
// (لا تحتاج تعديل لأن displayProducts تدعم الرابط مباشرة)
