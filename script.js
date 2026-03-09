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

// =============== التهيئة ===============

document.addEventListener('DOMContentLoaded', function() {
  if (currentUser && usersData[currentUser]) {
    showMainSite();
  } else {
    showLoginScreen();
  }
  
  // تحديث عداد الطلبات
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
  
  // تحميل البيانات
  loadUserData();
  displayProducts();
  renderCart();
  renderOrders();
  
  // رسالة ترحيب
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

  if (!district || !street || !home) {
    showNotification("❌ يرجى إدخال جميع البيانات", "error");
    return;
  }

  // إنشاء معرف فريد للمستخدم
  let userId = `${district}_${street}_${home}`;
  
  if (!usersData[userId]) {
    usersData[userId] = {
      profile: { district, street, home },
      orders: [],
      cart: [],
      joinDate: new Date().toLocaleDateString("ar-EG")
    };
  } else {
    usersData[userId].profile = { district, street, home };
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
    notification.remove();
  }, duration);
}

// =============== المنتجات ===============

const products = [
  { name: "صابون سائل", price: 35, img: "IMGS/صابون سائل.jpeg", category: "منظفات", available: true },
  { name: "سائل جلي", price: 12, img: "IMGS/سائل جلي.jpeg", category: "منظفات", available: true },
  { name: "معطر جو", price: 25, img: "IMGS/معطر.jpeg", category: "معطرات", available: false },
  { name: "دواء غسيل اوتوماتيك", price: 48, img: "IMGS/دواء غسيل.jpeg", category: "منظفات", available: true },
  { name: "دواء غسيل عادي", price: 45, img: "IMGS/دواء غسيل.jpeg", category: "منظفات", available: true },
  { name: "كلور", price: 12, img: "IMGS/كلور.jpeg", category: "منظفات", available: true },
  { name: "شامبو بالعسل", price: 110, img: "IMGS/شامبو عسل.jpeg", category: "شامبو", available: false },
  { name: "عملاق", price: 55, img: "IMGS/عملاق.jpeg", category: "منظفات", available: true },
  { name: "فلاش", price: 25, img: "IMGS/فلاش.jpeg", category: "منظفات", available: true }
];

function displayProducts() {
  const container = document.getElementById("products");
  if (!container) return;
  
  container.innerHTML = "";
  
  products.forEach((p, i) => {
    const isAvailable = p.available !== false;
    
    container.innerHTML += `
      <div class="card" data-category="${p.category}">
        <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200?text=${encodeURIComponent(p.name)}'">
        <div class="card-body">
          <h3>${p.name}</h3>
          <div class="price">💰 ${p.price} ${currency}</div>
          ${isAvailable ? `
            <select id="type${i}" class="product-select">
              <option value="kg">⚖️ كيلو</option>
              <option value="money">💵 مبلغ</option>
            </select>
            <input type="number" id="qty${i}" placeholder="الكمية" min="0.1" step="0.1" inputmode="decimal">
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

function filterProducts() {
  let searchText = document.getElementById('searchInput').value.toLowerCase();
  let cards = document.querySelectorAll('.card');
  let visibleCount = 0;
  
  cards.forEach(card => {
    let productName = card.querySelector('h3').innerText.toLowerCase();
    if (productName.includes(searchText)) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });
  
  if (visibleCount === 0 && searchText !== '') {
    showNotification("🔍 لا توجد منتجات مطابقة", "info");
  }
}

// =============== إدارة السلة ===============

function addToCart(i) {
  // التحقق من توفر المنتج
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
  let kg = type === "kg" ? qty : (qty / product.price);
  let total = kg * product.price;

  cart.push({ 
    name: product.name, 
    kg: kg.toFixed(2), 
    total: total.toFixed(2),
    price: product.price
  });
  
  saveUserData();
  renderCart();
  showNotification(`✅ تمت إضافة ${product.name}`, "success");
  
  // تأثير بسيط
  let floatingCart = document.querySelector('.floating-cart');
  if (floatingCart) {
    floatingCart.style.transform = 'scale(1.2)';
    setTimeout(() => {
      floatingCart.style.transform = 'scale(1)';
    }, 200);
  }
}

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
            <small>${item.kg} كغ</small>
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
    items: cart.map(i => `• ${i.name} - ${i.kg} كغ - ${i.total} ${currency}`),
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

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=` + encodeURIComponent(msg), '_blank');

  // تفريغ السلة بعد إرسال الطلب
  clearCart();
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

// =============== الرسالة المنبثقة ===============

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
