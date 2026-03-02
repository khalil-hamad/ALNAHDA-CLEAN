const currency = "₺";

// متغيرات عامة
let currentUser = "user"; // قيمة افتراضية ثابتة
let usersData = JSON.parse(localStorage.getItem("usersData")) || {
  user: {
    profile: {},
    orders: [],
    cart: []
  }
};
let cart = [];
let ordersHistory = [];

// =============== التهيئة ===============

document.addEventListener('DOMContentLoaded', function() {
  // تحميل البيانات مباشرة
  showMainSite();
});

// =============== نظام الدخول (بدون اسم) ===============

function showLoginScreen() {
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("mainSite").style.display = "none";
}

function showMainSite() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("mainSite").style.display = "block";
  
  // عرض اسم افتراضي
  document.getElementById("userName").innerText = "العميل";
  
  // تحميل البيانات
  loadUserData();
  displayProducts();
  renderCart();
  renderOrders();
  updateVisitorCount();
}

function loadUserData() {
  if (usersData && usersData.user) {
    cart = usersData.user.cart || [];
    ordersHistory = usersData.user.orders || [];
  } else {
    cart = [];
    ordersHistory = [];
  }
}

function saveUserData() {
  if (!usersData.user) {
    usersData.user = {
      profile: {},
      orders: [],
      cart: []
    };
  }
  usersData.user.cart = cart;
  usersData.user.orders = ordersHistory;
  localStorage.setItem("usersData", JSON.stringify(usersData));
}

function saveClientData() {
  let district = document.getElementById("district").value;
  let street = document.getElementById("street").value.trim();
  let home = document.getElementById("home").value.trim();

  if (!district || !street || !home) {
    showToast("❌ يرجى إدخال جميع بيانات العنوان", "error");
    return;
  }

  if (!usersData.user) {
    usersData.user = {
      profile: { name: "العميل", district, street, home },
      orders: [],
      cart: []
    };
  } else {
    usersData.user.profile = { name: "العميل", district, street, home };
  }
  
  localStorage.setItem("usersData", JSON.stringify(usersData));
  showToast(`✅ تم حفظ العنوان`, "success");
  showMainSite();
}

function logout() {
  if (!confirm("👋 هل تريد مسح البيانات؟")) return;
  localStorage.removeItem("usersData");
  usersData = {
    user: {
      profile: {},
      orders: [],
      cart: []
    }
  };
  cart = [];
  ordersHistory = [];
  showLoginScreen();
  showToast("🗑️ تم مسح البيانات", "info");
}

function showFullAddress() {
  if (usersData.user && usersData.user.profile && usersData.user.profile.district) {
    let profile = usersData.user.profile;
    showToast(`📍 ${profile.district} - حارة ${profile.street} - بيت ${profile.home}`, "info");
  } else {
    showToast("⚠️ لم يتم إدخال العنوان بعد", "warning");
  }
}

// =============== المنتجات ===============

const products = [
  { name: "صابون سائل", price: 35, img: "IMGS/صابون سائل.jpeg", category: "منظفات", available: true },
  { name: "سائل جلي", price: 10, img: "IMGS/سائل جلي.jpeg", category: "منظفات", available: true },
  { name: "معطر ", price: 25, img: "IMGS/معطر.jpeg", category: "معطر", available: false },
  { name: "دواء غسيل اوتوماتيك", price: 45, img: "IMGS/دواء غسيل.jpeg", category: "منظفات", available: true },
  { name: "دواء غسيل عادي", price: 45, img: "IMGS/دواء غسيل.jpeg", category: "منظفات", available: true },
  { name: "كلور", price: 13, img: "IMGS/كلور.jpeg", category: "منظفات", available: true },
  { name: "شامبو بالعسل", price: 110, img: "IMGS/شامبو عسل.jpeg", category: "شامبو", available: true },
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
            <div style="background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; text-align: center; margin-top: 10px;">
              <i class="fas fa-times-circle"></i>
              غير متوفر حالياً
            </div>
          `}
        </div>
      </div>`;
  });
}

function filterCategory(category) {
  let cards = document.querySelectorAll('.card');
  let btns = document.querySelectorAll('.category-btn');
  
  btns.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  cards.forEach(card => {
    if (category === 'all' || card.dataset.category === category) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
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
    showToast("🔍 لا توجد منتجات مطابقة", "info");
  }
}

// =============== إدارة السلة ===============

function addToCart(i) {
  // التحقق من أن المنتج متوفر
  if (products[i].available === false) {
    showToast("❌ هذا المنتج غير متوفر حالياً", "error");
    return;
  }
  
  let type = document.getElementById(`type${i}`).value;
  let qty = parseFloat(document.getElementById(`qty${i}`).value);
  
  if (!qty || qty <= 0) {
    showToast("❌ أدخل كمية صحيحة", "error");
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
  showToast(`✅ تمت إضافة ${product.name}`, "success");
  
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
  
  let user = usersData.user?.profile;
  if (user && user.district) {
    items.innerHTML += `
      <div class="cart-user">
        <i class="fas fa-user"></i> 👤 ${user.name || "العميل"}<br>
        <small>📍 ${user.district || ""} - ${user.street || ""} - ${user.home || ""}</small>
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
            <button onclick="removeFromCart(${index})" style="width:32px; height:32px; border-radius:50%; background:#e74c3c; color:white; border:none; margin-right:5px;">
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
  showToast("🗑️ تم حذف المنتج", "info");
}

function clearCart() {
  if (cart.length === 0) {
    showToast("السلة فارغة", "info");
    return;
  }
  if (!confirm("❓ هل تريد تفريغ السلة؟")) return;
  
  cart = [];
  saveUserData();
  renderCart();
  showToast("🗑️ تم تفريغ السلة", "info");
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
          <b>👤 ${order.client || "العميل"}</b>
          <button onclick="deleteOrder(${index})" style="background:none; border:none; color:#e74c3c; font-size:18px; width:auto; padding:5px;">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <small>🕒 ${order.date}</small><br>
        <small>📍 ${order.address || ''}</small>
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
  showToast("🗑️ تم حذف الطلب", "info");
}

function clearAllOrders() {
  if (!ordersHistory || ordersHistory.length === 0) {
    showToast("لا توجد طلبات", "info");
    return;
  }
  
  if (!confirm("⚠️ هل أنت متأكد من مسح جميع الطلبات؟")) return;
  
  ordersHistory = [];
  saveUserData();
  renderOrders();
  showToast("🗑️ تم مسح جميع الطلبات", "info");
}

// =============== واتساب ===============

function sendWhatsApp() {
  if (cart.length === 0) {
    showToast("❌ السلة فارغة", "error");
    return;
  }

  let now = new Date();
  let date = now.toLocaleString("ar-EG");
  let user = usersData.user?.profile;

  if (!user || !user.district) {
    showToast("❌ يرجى إدخال العنوان أولاً", "error");
    toggleCart();
    showLoginScreen();
    return;
  }

  let address = `${user.district} - حارة ${user.street} - بيت ${user.home}`;

  let order = {
    client: "العميل",
    date: date,
    address: address,
    items: cart.map(i => `• ${i.name} - ${i.kg} كغ - ${i.total} ${currency}`),
    total: cart.reduce((s, i) => s + parseFloat(i.total), 0).toFixed(2)
  };

  ordersHistory.unshift(order);
  saveUserData();

  // رسالة واتساب
  let msg = `🛍️ *طلب جديد*\n\n`;
  msg += `📍 *العنوان:* ${address}\n`;
  msg += `──────────────\n`;
  msg += `*🛒 الطلب:*\n`;
  order.items.forEach(i => msg += i + "\n");
  msg += `──────────────\n`;
  msg += `💰 *الإجمالي:* ${order.total} ${currency}\n`;
  msg += `🕒 *التاريخ:* ${date}\n`;
  msg += `──────────────\n`;
  msg += `✅ شكراً لتسوقك من معمل النهضة`;

  window.open("https://wa.me/963947760414?text=" + encodeURIComponent(msg), '_blank');

  // تفريغ السلة بعد إرسال الطلب
  cart = [];
  saveUserData();
  renderCart();
  toggleCart(); // إغلاق السلة
  showToast("📤 تم إرسال الطلب وتفريغ السلة", "success");
}

// =============== عداد الزوار ===============

function updateVisitorCount() {
  let count = localStorage.getItem("visitorCount") || 0;
  count = parseInt(count) + 1;
  localStorage.setItem("visitorCount", count);
  
  let visitorElement = document.getElementById("visitorCount");
  if (visitorElement) {
    visitorElement.innerText = count;
  }
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
