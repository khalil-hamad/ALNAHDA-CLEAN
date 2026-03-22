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
const ADMIN_PASSWORD = "996225386048";

// =============== إعدادات Firebase ===============
const firebaseConfig = {
  apiKey: "AIzaSyD7WmJ_RsJ4rWZk3V_b2I7-Y9eHdGwNz6g",
  authDomain: "lamsat-c.firebaseapp.com",
  projectId: "lamsat-c",
  storageBucket: "lamsat-c.firebasestorage.app",
  messagingSenderId: "252887125400",
  appId: "1:252887125400:web:d5c662eee9f6def88eafed",
  measurementId: "G-MV0HPM46PB"
};

// تهيئة Firebase
let database;
try {
  firebase.initializeApp(firebaseConfig);
  database = firebase.database();
  console.log("✅ Firebase initialized successfully");
} catch (error) {
  console.log("⚠️ Firebase already initialized or error:", error);
  database = firebase.database();
}

// =============== الحصول على المنتجات ===============
function getProducts() {
  let products = JSON.parse(localStorage.getItem("products"));
  if (!products || products.length === 0) {
    products = getDefaultProducts();
    localStorage.setItem("products", JSON.stringify(products));
  }
  return products;
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

// =============== مزامنة Firebase ===============
async function loadProductsFromFirebase() {
  try {
    const snapshot = await database.ref('products').once('value');
    const products = snapshot.val();
    if (products) {
      const productsArray = Object.values(products);
      localStorage.setItem("products", JSON.stringify(productsArray));
      console.log("✅ Products loaded from Firebase");
      return productsArray;
    } else {
      console.log("⚠️ No products in Firebase, using default");
      const defaultProducts = getDefaultProducts();
      localStorage.setItem("products", JSON.stringify(defaultProducts));
      await database.ref('products').set(defaultProducts);
      return defaultProducts;
    }
  } catch (error) {
    console.error("❌ Error loading from Firebase:", error);
    const localProducts = getProducts();
    return localProducts;
  }
}

function listenToProductChanges() {
  if (!database) return;
  database.ref('products').on('value', (snapshot) => {
    const products = snapshot.val();
    if (products) {
      const productsArray = Object.values(products);
      const oldProducts = JSON.parse(localStorage.getItem("products")) || [];
      localStorage.setItem("products", JSON.stringify(productsArray));
      if (JSON.stringify(oldProducts) !== JSON.stringify(productsArray)) {
        refreshUserProducts();
        updateCartAfterProductChange();
        showNotification("🔄 تم تحديث قائمة المنتجات", "info", 3000);
      }
    }
  });
}

function refreshUserProducts() {
  if (document.getElementById("mainSite").style.display === "block") {
    displayProducts();
    collectProductImages();
  }
}

function updateCartAfterProductChange() {
  const products = getProducts();
  let cartChanged = false;
  
  for (let i = cart.length - 1; i >= 0; i--) {
    const productExists = products.find(p => p.name === cart[i].name);
    if (!productExists || productExists.available === false) {
      cart.splice(i, 1);
      cartChanged = true;
    }
  }
  
  if (cartChanged) {
    saveUserData();
    renderCart();
  }
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
document.addEventListener('DOMContentLoaded', async function() {
  // تحميل المنتجات من Firebase
  await loadProductsFromFirebase();
  listenToProductChanges();
  
  if (currentUser && usersData[currentUser]) {
    showMainSite();
  } else {
    showLoginScreen();
  }
  
  updateOrdersCounter();
});

function showLoginScreen() {
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("mainSite").style.display = "none";
}

function showMainSite() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("mainSite").style.display = "block";
  
  if (currentUser && usersData[currentUser] && usersData[currentUser].profile) {
    let profile = usersData[currentUser].profile;
    document.getElementById("userAddress").innerText = `${profile.district}`;
  }
  
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
      usersData[currentUser] = { profile: {}, orders: [], cart: [] };
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
      <div class="notification-title">${type === 'success' ? 'تم بنجاح' : type === 'error' ? 'خطأ' : 'تنبيه'}</div>
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
async function displayProducts() {
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
  
  box.innerHTML += `<button class="clear-orders-btn" onclick="clearAllOrders()"><i class="fas fa-trash"></i> مسح جميع الطلبات (${ordersHistory.length})</button>`;
  
  ordersHistory.slice(0, 20).forEach((order, index) => {
    box.innerHTML += `
      <div class="order-item">
        <div style="display:flex; justify-content:space-between; align-items:start;">
          <b>📍 ${order.address || 'عنوان غير محدد'}</b>
          <button onclick="deleteOrder(${index})" style="background:none; border:none; color:#ef476f; font-size:18px; width:auto; padding:5px;"><i class="fas fa-times"></i></button>
        </div>
        <small>🕒 ${order.date}</small>
        <div style="background:#f0f0f0; padding:8px; border-radius:8px; margin:8px 0; font-size:12px;">${order.items.slice(0, 3).join("<br>")}${order.items.length > 3 ? `<br>... و${order.items.length - 3} أخرى` : ''}</div>
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
  if (!ordersHistory || ordersHistory.length === 0) return;
  if (!confirm("⚠️ هل أنت متأكد من مسح جميع الطلبات؟")) return;
  ordersHistory = [];
  saveUserData();
  renderOrders();
  showNotification("🗑️ تم مسح جميع الطلبات", "info");
}

function updateOrdersCounter() {
  const counterElement = document.getElementById('ordersCount');
  if (counterElement) counterElement.innerText = ordersCount.toString().padStart(2, '0');
}

function incrementOrdersCounter() {
  ordersCount++;
  localStorage.setItem("ordersCount", ordersCount);
  updateOrdersCounter();
}

// =============== واتساب ===============
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
  let order = { address, date, items: cart.map(i => `• ${i.name} - ${i.kg} ${i.unit === "علبة" ? "علبة" : "كغ"} - ${i.total} ${currency}`), total };
  ordersHistory.unshift(order);
  saveUserData();
  incrementOrdersCounter();
  let msg = `🛍️ *طلب جديد*\n\n📍 *العنوان:* ${address}\n──────────────\n*🛒 الطلب:*\n${order.items.join("\n")}\n──────────────\n💰 *الإجمالي:* ${total} ${currency}\n🕒 *التاريخ:* ${date}\n──────────────\n✅ شكراً لتسوقك من معمل النهضة`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=` + encodeURIComponent(msg), '_blank');
  cart = [];
  saveUserData();
  renderCart();
  showNotification("📤 تم إرسال الطلب", "success");
}

function sendNoteToWhatsApp() {
  let note = document.getElementById("userNote").value.trim();
  let noteType = document.getElementById("noteType").value;
  if (!note) {
    showNotification("❌ اكتب ملاحظاتك أولاً", "error");
    return;
  }
  let user = usersData[currentUser]?.profile;
  let date = new Date().toLocaleString("ar-EG");
  const typeNames = { suggestion: '💡 اقتراح', complaint: '⚠️ شكوى', inquiry: '❓ استفسار', praise: '🌟 إشادة' };
  let msg = `📝 *${typeNames[noteType]} من عميل*\n\n${user ? `📍 *العنوان:* ${user.district} - ${user.street} - ${user.home}\n` : ''}🕒 *التاريخ:* ${date}\n──────────────\n*💬 الملاحظة:*\n${note}\n──────────────\n✅ شكراً لتواصلك معنا`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=` + encodeURIComponent(msg), '_blank');
  document.getElementById("userNote").value = "";
  showNotification("📤 تم إرسال ملاحظاتك", "success");
}

// =============== معاينة الصور ===============
let currentImageIndex = 0;
let productImages = [];

function collectProductImages() {
  productImages = [];
  const products = getProducts();
  products.forEach((product, index) => { productImages.push({ src: product.img, alt: product.name, index: index }); });
}

function openImageModalByIndex(index) {
  collectProductImages();
  currentImageIndex = index;
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const caption = document.getElementById('modalCaption');
  if (productImages[index]) { modalImg.src = productImages[index].src; caption.innerHTML = productImages[index].alt; }
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
  if (currentImageIndex < 0) currentImageIndex = productImages.length - 1;
  if (currentImageIndex >= productImages.length) currentImageIndex = 0;
  const modalImg = document.getElementById('modalImage');
  const caption = document.getElementById('modalCaption');
  if (productImages[currentImageIndex]) { modalImg.src = productImages[currentImageIndex].src; caption.innerHTML = productImages[currentImageIndex].alt; }
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

function addNavigationButtons() {
  const modal = document.getElementById('imageModal');
  if (document.querySelector('.nav-btn')) return;
  const prevBtn = document.createElement('button');
  prevBtn.className = 'nav-btn prev-btn';
  prevBtn.innerHTML = '❮';
  prevBtn.onclick = (e) => { e.stopPropagation(); navigateImage(-1); };
  const nextBtn = document.createElement('button');
  nextBtn.className = 'nav-btn next-btn';
  nextBtn.innerHTML = '❯';
  nextBtn.onclick = (e) => { e.stopPropagation(); navigateImage(1); };
  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'download-image';
  downloadBtn.innerHTML = '<i class="fas fa-download"></i> تحميل الصورة';
  downloadBtn.onclick = (e) => { e.stopPropagation(); downloadCurrentImage(); };
  modal.appendChild(prevBtn);
  modal.appendChild(nextBtn);
  modal.appendChild(downloadBtn);
}

document.addEventListener('keydown', function(e) {
  const modal = document.getElementById('imageModal');
  if (!modal.classList.contains('active')) return;
  if (e.key === 'Escape') closeImageModal();
  else if (e.key === 'ArrowLeft') navigateImage(-1);
  else if (e.key === 'ArrowRight') navigateImage(1);
});

setTimeout(() => { collectProductImages(); addNavigationButtons(); }, 1000);

function toggleBuildingInput() {
  const district = document.getElementById("district").value;
  const buildingSelect = document.getElementById("building");
  if (district === "النهضة") buildingSelect.style.display = "block";
  else buildingSelect.style.display = "none";
}

function showToast(message, type = "info") {
  let toast = document.getElementById("toast");
  if (!toast) return;
  toast.innerText = message;
  toast.style.opacity = "1";
  toast.style.bottom = "100px";
  setTimeout(() => { toast.style.opacity = "0"; toast.style.bottom = "80px"; }, 2000);
}
