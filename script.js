const currency = "₺";

// متغيرات عامة
let currentUser = localStorage.getItem("currentUser");
let usersData = JSON.parse(localStorage.getItem("usersData")) || {};
let cart = [];
let ordersHistory = [];
let userPoints = 0;
let pointsHistory = [];
let pendingOrders = JSON.parse(localStorage.getItem("pendingOrders")) || [];

// كلمة سر صاحب المتجر (يمكن تغييرها)
const ADMIN_PASSWORD = "admin123";
const ADMIN_USER_ID = "996225386048";

// =============== التهيئة ===============

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded', currentUser);
  
  // التحقق من الوضع الليلي المحفوظ
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeBtn').innerHTML = '<i class="fas fa-sun"></i>';
  }
  
  if (currentUser && usersData[currentUser]) {
    showMainSite();
    // التحقق إذا كان المستخدم هو صاحب المتجر
    checkIfAdmin();
  } else {
    showLoginScreen();
  }
});

// =============== التحقق من صاحب المتجر ===============

function checkIfAdmin() {
  console.log('Checking admin, currentUser:', currentUser);
  console.log('Admin ID:', ADMIN_USER_ID);
  
  const adminBtn = document.getElementById('adminBtn');
  if (!adminBtn) {
    console.log('Admin button not found');
    return;
  }
  
  if (currentUser === ADMIN_USER_ID) {
    console.log('User is admin - showing button');
    adminBtn.style.display = 'flex';
  } else {
    console.log('User is not admin - hiding button');
    adminBtn.style.display = 'none';
  }
}

function toggleAdminPanel() {
  console.log('Toggling admin panel');
  const panel = document.getElementById('adminPanel');
  if (!panel) {
    console.log('Admin panel not found');
    return;
  }
  
  panel.classList.toggle('active');
  console.log('Panel active:', panel.classList.contains('active'));
  
  if (panel.classList.contains('active')) {
    loadAdminData();
    renderPendingOrders();
  }
}

function loadAdminData() {
  console.log('Loading admin data');
  
  // تحميل قائمة العملاء
  const customerSelect = document.getElementById('adminCustomer');
  if (!customerSelect) {
    console.log('Customer select not found');
    return;
  }
  
  customerSelect.innerHTML = '<option value="">اختر العميل</option>';
  
  let totalCustomers = 0;
  let totalOrders = 0;
  let totalPoints = 0;
  
  // عرض جميع العملاء المسجلين (بما فيهم صاحب المتجر نفسه)
  Object.keys(usersData).forEach(userId => {
    if (usersData[userId].profile) {
      totalCustomers++;
      totalOrders += (usersData[userId].orders || []).length;
      totalPoints += (usersData[userId].points || 0);
      
      const profile = usersData[userId].profile;
      customerSelect.innerHTML += `
        <option value="${userId}">
          ${profile.district} - ${profile.street} - ${profile.home}
        </option>
      `;
    }
  });
  
  document.getElementById('totalCustomers').innerText = totalCustomers;
  document.getElementById('totalOrders').innerText = totalOrders;
  document.getElementById('totalPoints').innerText = totalPoints;
  document.getElementById('pendingCount').innerText = pendingOrders.length;
  
  // عرض قائمة العملاء
  renderCustomersList();
  
  // عرض سجل النقاط
  renderPointsLog();
  
  console.log('Admin data loaded');
}

function renderCustomersList() {
  const customersList = document.getElementById('customersList');
  customersList.innerHTML = '';
  
  // ترتيب العملاء حسب تاريخ الانضمام (الأحدث أولاً)
  const sortedCustomers = Object.keys(usersData)
    .filter(userId => usersData[userId].profile)
    .sort((a, b) => {
      const dateA = usersData[a].joinDate || '2000-01-01';
      const dateB = usersData[b].joinDate || '2000-01-01';
      return dateB.localeCompare(dateA);
    });
  
  sortedCustomers.forEach(userId => {
    const user = usersData[userId];
    if (user.profile) {
      customersList.innerHTML += `
        <div class="customer-item">
          <div class="customer-info">
            <span class="customer-name">${user.profile.district}</span>
            <span class="customer-address">${user.profile.street} - ${user.profile.home}</span>
            <div class="customer-join-date">📅 تاريخ التسجيل: ${user.joinDate || 'غير معروف'}</div>
          </div>
          <div class="customer-points">${user.points || 0} نقطة</div>
        </div>
      `;
    }
  });
}

function renderPointsLog() {
  const logDiv = document.getElementById('pointsLog');
  logDiv.innerHTML = '';
  
  // جمع كل سجلات النقاط من جميع المستخدمين
  const allLogs = [];
  
  Object.keys(usersData).forEach(userId => {
    if (usersData[userId].pointsHistory) {
      usersData[userId].pointsHistory.forEach(log => {
        allLogs.push({
          ...log,
          user: userId
        });
      });
    }
  });
  
  // ترتيب حسب التاريخ (الأحدث أولاً)
  allLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (allLogs.length === 0) {
    logDiv.innerHTML = '<p style="text-align:center; color:#888;">لا يوجد سجل نقاط</p>';
    return;
  }
  
  allLogs.slice(0, 20).forEach(log => {
    const user = usersData[log.user]?.profile;
    const userInfo = user ? `${user.district} - ${user.street}` : 'مستخدم غير معروف';
    
    logDiv.innerHTML += `
      <div class="log-item">
        <div style="display:flex; justify-content:space-between;">
          <span>${userInfo}</span>
          <small>${log.date}</small>
        </div>
        <div>
          <strong style="color:${log.type === 'earned' ? '#28a745' : '#dc3545'}">
            ${log.type === 'earned' ? '+' : '-'} ${log.points} نقطة
          </strong>
          ${log.total ? `<br><small>💰 قيمة الطلب: ${log.total} ₺</small>` : ''}
          ${log.addedBy === 'admin' ? '<br><small>👑 تمت الإضافة بواسطة المدير</small>' : ''}
        </div>
      </div>
    `;
  });
}

function renderPendingOrders() {
  const container = document.getElementById('pendingOrdersList');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (pendingOrders.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#888;">لا توجد طلبات جديدة</p>';
    return;
  }
  
  pendingOrders.forEach((order, index) => {
    container.innerHTML += `
      <div class="pending-order-item">
        <div class="pending-order-header">
          <span class="pending-order-title">🆕 طلب جديد #${index + 1}</span>
          <span class="pending-order-amount">💰 ${order.total} ₺</span>
        </div>
        <div class="pending-order-details">
          <div>📍 ${order.address}</div>
          <div>🕒 ${order.date}</div>
          <div>📦 ${order.items.length} منتج</div>
        </div>
        <div class="pending-order-actions">
          <button class="pending-order-btn add-points-btn" onclick="showAddPointsForOrder(${index})">
            <i class="fas fa-star"></i> إضافة نقاط
          </button>
          <button class="pending-order-btn ignore-btn" onclick="ignoreOrder(${index})">
            <i class="fas fa-times"></i> تجاهل
          </button>
        </div>
      </div>
    `;
  });
}

function showAddPointsForOrder(orderIndex) {
  const order = pendingOrders[orderIndex];
  
  // تعبئة نموذج إضافة النقاط
  const customerSelect = document.getElementById('adminCustomer');
  
  // البحث عن العميل
  let foundCustomerId = null;
  Object.keys(usersData).forEach(userId => {
    if (usersData[userId].profile) {
      const profile = usersData[userId].profile;
      const address = `${profile.district} - ${profile.street} - ${profile.home}`;
      if (address === order.address) {
        foundCustomerId = userId;
      }
    }
  });
  
  if (foundCustomerId) {
    customerSelect.value = foundCustomerId;
    document.getElementById('adminAmount').value = parseFloat(order.total);
    
    // إزالة الطلب من قائمة الانتظار
    pendingOrders.splice(orderIndex, 1);
    localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
    
    // تحديث العرض
    renderPendingOrders();
    document.getElementById('pendingCount').innerText = pendingOrders.length;
    
    showNotification('✅ تم نقل الطلب لإضافة النقاط', 'success');
  } else {
    showNotification('❌ لم يتم العثور على العميل', 'error');
  }
}

function ignoreOrder(index) {
  if (!confirm('هل تريد تجاهل هذا الطلب؟')) return;
  
  pendingOrders.splice(index, 1);
  localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
  
  renderPendingOrders();
  document.getElementById('pendingCount').innerText = pendingOrders.length;
  
  showNotification('🗑️ تم تجاهل الطلب', 'info');
}

function addPointsByAdmin() {
  const customerId = document.getElementById('adminCustomer').value;
  const amount = parseFloat(document.getElementById('adminAmount').value);
  
  if (!customerId || !amount || amount <= 0) {
    showNotification('❌ يرجى اختيار العميل وإدخال المبلغ', 'error');
    return;
  }
  
  // حساب النقاط (كل 30 ليرة = نقطة)
  const pointsToAdd = Math.floor(amount / 30);
  
  if (usersData[customerId]) {
    if (!usersData[customerId].points) usersData[customerId].points = 0;
    if (!usersData[customerId].pointsHistory) usersData[customerId].pointsHistory = [];
    
    usersData[customerId].points += pointsToAdd;
    
    usersData[customerId].pointsHistory.unshift({
      date: new Date().toLocaleDateString('ar-EG'),
      points: pointsToAdd,
      total: amount,
      type: 'earned',
      addedBy: 'admin'
    });
    
    localStorage.setItem('usersData', JSON.stringify(usersData));
    
    const result = document.getElementById('adminPointsResult');
    result.innerHTML = `✅ تم إضافة ${pointsToAdd} نقطة للعميل بنجاح`;
    result.classList.add('active');
    
    document.getElementById('adminAmount').value = '';
    
    showNotification(`✅ تم إضافة ${pointsToAdd} نقطة`, 'success');
    
    setTimeout(() => {
      result.classList.remove('active');
    }, 3000);
    
    // تحديث الإحصائيات
    loadAdminData();
  }
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
  loadUserPoints();
  displayProducts();
  renderCart();
  renderOrders();
  
  // رسالة ترحيب
  setTimeout(() => {
    showNotification('👋 أهلاً بك في معمل النهضة', 'info', 3000);
  }, 1000);
  
  // التحقق من صاحب المتجر بعد تحميل الموقع
  setTimeout(() => {
    checkIfAdmin();
  }, 500);
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
        cart: [],
        points: 0,
        pointsHistory: []
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

  // التحقق إذا كان هذا هو صاحب المتجر
  if (street.toLowerCase() === 'admin' && home === '123') {
    console.log('Admin login detected');
    currentUser = ADMIN_USER_ID;
    
    if (!usersData[ADMIN_USER_ID]) {
      usersData[ADMIN_USER_ID] = {
        profile: { district, street, home },
        orders: [],
        cart: [],
        points: 0,
        pointsHistory: [],
        isAdmin: true,
        joinDate: new Date().toLocaleDateString("ar-EG")
      };
    }
    
    localStorage.setItem("currentUser", ADMIN_USER_ID);
    localStorage.setItem("usersData", JSON.stringify(usersData));
    
    showNotification(`👑 مرحباً خليل كيف الحال`, "success");
    showMainSite();
    return;
  }

  // إنشاء معرف فريد للمستخدم العادي (الحي + الشارع + البيت)
  let userId = `${district}_${street}_${home}`;
  
  if (!usersData[userId]) {
    usersData[userId] = {
      profile: { district, street, home },
      orders: [],
      cart: [],
      points: 0,
      pointsHistory: [],
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

// =============== الوضع الليلي ===============

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const btn = document.getElementById('darkModeBtn');
  
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('darkMode', 'enabled');
    btn.innerHTML = '<i class="fas fa-sun"></i>';
    showNotification('🌙 تم تفعيل الوضع الليلي', 'info');
  } else {
    localStorage.setItem('darkMode', 'disabled');
    btn.innerHTML = '<i class="fas fa-moon"></i>';
    showNotification('☀️ تم تفعيل الوضع النهاري', 'info');
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

// =============== نظام النقاط ===============

function loadUserPoints() {
  if (currentUser && usersData[currentUser]) {
    userPoints = usersData[currentUser].points || 0;
    pointsHistory = usersData[currentUser].pointsHistory || [];
  }
  updatePointsDisplay();
}

function updatePointsDisplay() {
  const pointsElements = document.querySelectorAll('#pointsDisplay');
  pointsElements.forEach(el => {
    if (el) el.innerText = userPoints;
  });
}

function showLoyaltyInfo() {
  const modal = document.getElementById('loyaltyModal');
  document.getElementById('modalPoints').innerText = userPoints;
  
  // عرض تاريخ النقاط
  const historyDiv = document.getElementById('pointsHistory');
  historyDiv.innerHTML = '';
  
  if (pointsHistory.length === 0) {
    historyDiv.innerHTML = '<p style="text-align:center; color:#888;">لا يوجد سابق نقاط</p>';
  } else {
    pointsHistory.slice(0, 10).forEach(item => {
      historyDiv.innerHTML += `
        <div class="order-item" style="margin-bottom:5px;">
          <small>${item.date}</small><br>
          <span style="color: ${item.type === 'earned' ? '#2ecc71' : '#e74c3c'};">
            ${item.type === 'earned' ? '+' : '-'} ${item.points} نقطة
          </span>
          ${item.total ? `<br><small>قيمة الطلب: ${item.total} ₺</small>` : ''}
          ${item.addedBy === 'admin' ? '<br><small>👑 تمت الإضافة بواسطة المدير</small>' : ''}
        </div>
      `;
    });
  }
  
  modal.classList.add('active');
}

function closeLoyaltyModal() {
  document.getElementById('loyaltyModal').classList.remove('active');
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
  let adminPanel = document.getElementById("adminPanel");
  
  cartElement.classList.toggle("active");
  ordersElement.classList.remove("active");
  if (adminPanel) adminPanel.classList.remove("active");
}

// =============== إدارة الطلبات ===============

function toggleOrders() {
  let ordersElement = document.getElementById("orders");
  let cartElement = document.getElementById("cart");
  let adminPanel = document.getElementById("adminPanel");
  
  ordersElement.classList.toggle("active");
  cartElement.classList.remove("active");
  if (adminPanel) adminPanel.classList.remove("active");
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
          <button onclick="deleteOrder(${index})" style="background:none; border:none; color:#e74c3c; font-size:18px; width:auto; padding:5px;">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <small>🕒 ${order.date}</small>
        <div style="background:#f0f0f0; padding:8px; border-radius:8px; margin:8px 0; font-size:12px;">
          ${order.items.slice(0, 3).join("<br>")}
          ${order.items.length > 3 ? `<br>... و${order.items.length - 3} أخرى` : ''}
        </div>
        <b>💰 ${order.total} ${currency}</b>
        <div style="margin-top:5px; color:#f39c12;">
          <i class="fas fa-star"></i> ${order.points || 0} نقطة
        </div>
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
  
  // حساب النقاط (فقط للعرض - لا تضاف)
  let pointsEarned = Math.floor(total / 10);

  let order = {
    address: address,
    date: date,
    items: cart.map(i => `• ${i.name} - ${i.kg} كغ - ${i.total} ${currency}`),
    total: total,
    points: pointsEarned
  };

  // حفظ الطلب في سجل العميل
  ordersHistory.unshift(order);
  
  // إضافة الطلب إلى قائمة الانتظار لصاحب المتجر
  pendingOrders.unshift({
    ...order,
    customerId: currentUser,
    status: 'pending'
  });
  
  localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
  saveUserData();

  // رسالة واتساب
  let msg = `🛍️ *طلب جديد*\n\n`;
  msg += `📍 *العنوان:* ${address}\n`;
  msg += `──────────────\n`;
  msg += `*🛒 الطلب:*\n`;
  order.items.forEach(i => msg += i + "\n");
  msg += `──────────────\n`;
  msg += `💰 *الإجمالي:* ${total} ${currency}\n`;
  msg += `🌟 *النقاط المستحقة:* ${pointsEarned}\n`;
  msg += `🕒 *التاريخ:* ${date}\n`;
  msg += `──────────────\n`;
  msg += `✅ شكراً لتسوقك من معمل النهضة`;

  window.open("https://wa.me/963947760414?text=" + encodeURIComponent(msg), '_blank');

  // تفريغ السلة بعد إرسال الطلب
  clearCart();
  showNotification("📤 تم إرسال الطلب", "success");
  
  // إذا كان صاحب المتجر مسجل الدخول، نحدث الصفحة
  if (currentUser === ADMIN_USER_ID) {
    loadAdminData();
    renderPendingOrders();
  }
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

  window.open("https://wa.me/963947760414?text=" + encodeURIComponent(msg), '_blank');
  
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


