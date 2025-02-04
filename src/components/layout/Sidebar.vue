<template>
  <aside class="sidebar" :class="{ 'is-mobile-open': isMobileOpen }">
    <div class="user-info">
      <!-- Kullanıcı bilgileri -->
    </div>
    <nav class="sidebar-nav">
      <ul>
        <li><router-link to="/">Özet</router-link></li>
        <li>
          <router-link to="/calendar" class="calendar-link">
            <span>Takvim</span>
            <i class="fas fa-eye"></i>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script>
export default {
  name: 'Sidebar',
  props: {
    isMobileOpen: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 280px;
  background-color: #FFFFFF;
  padding: 1.5rem;
  color: #003B5C;
  height: 100%;
  overflow-y: auto;
  border-right: 1px solid rgba(0,59,92,0.1);
  box-shadow: 2px 0 6px rgba(0, 59, 92, 0.1);
  display: flex;
  flex-direction: column;
}

.sidebar-nav {
  flex: 1;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin-top: 1rem;
}

.sidebar-nav li {
  margin-bottom: 0.75rem;
}

.sidebar-nav a {
  text-decoration: none;
  color: #003B5C;
  display: block;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.sidebar-nav a:hover {
  background-color: rgba(0,178,169,0.1);
  color: #00B2A9;
}

.sidebar-nav a.router-link-active {
  background-color: rgba(0,155,159,0.15);
  color: #009B9F;
  font-weight: 600;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -280px;
    top: 0;
    bottom: 0;
    height: 100vh;
    transition: transform 0.3s ease;
    z-index: 1;
    overflow-y: auto;
    padding-top: 5rem;
  }

  .sidebar.is-mobile-open {
    transform: translateX(280px);
    box-shadow: 2px 0 10px rgba(0, 59, 92, 0.2);
  }
}

.calendar-link {
  display: flex !important;
  align-items: center;
  justify-content: space-between;
}

.calendar-link i {
  font-size: 0.9rem;
  opacity: 0.7;
}

.calendar-link:hover i {
  opacity: 1;
}

/* Scrollbar stilleri */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(0, 59, 92, 0.05);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(0, 59, 92, 0.1);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 59, 92, 0.2);
}
</style> 