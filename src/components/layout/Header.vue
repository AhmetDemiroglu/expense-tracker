<template>
  <header class="header">
    <div class="header-left">
      <button class="menu-toggle" @click="toggleSidebar" aria-label="Toggle Menu">
        <i class="fas fa-bars"></i>
      </button>
      
      <router-link to="/" class="brand">
        <img 
          src="@/assets/logo.png" 
          alt="Bütçe360° Logo" 
          class="logo"
        />
        <h1 class="brand-name">
          <span class="butce">Bütçe</span>
          <span class="derece">360°</span>
        </h1>
      </router-link>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header',
  methods: {
    toggleSidebar() {
      this.$emit('toggle-sidebar')
    }
  }
}
</script>

<style scoped>
@keyframes gradientAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.header {
  background: #FFFFFF;
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(0,59,92,0.1);
  box-shadow: 0 2px 4px rgba(0, 59, 92, 0.05);
  position: relative;
  z-index: 100;
  display: flex;
  align-items: center;
  height: 72px;
  background: linear-gradient(
    270deg,
    rgba(0, 155, 159, 0.15) 0%,
    rgba(0, 178, 169, 0.1) 25%,
    rgba(0, 59, 92, 0.05) 50%,
    rgba(0, 178, 169, 0.1) 75%,
    rgba(0, 155, 159, 0.15) 100%
  );
  background-size: 200% 100%;
  animation: gradientAnimation 10s ease infinite;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
  padding: 0.5rem;
  color: #FFFFFF;
  transition: color 0.2s ease;
}

.menu-toggle:hover {
  color: #00B2A9;
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: inherit;
}

.logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.brand-name {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.75rem;
  margin: 0;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.butce {
  color: #003B5C;
  font-weight: 600;
}

.derece {
  color: #009B9F;
  font-weight: 700;
}

/* Mobil responsive tasarım */
@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }

  .brand {
    margin-left: 0.75rem;
  }

  .brand-name {
    font-size: 1.5rem;
  }

  .logo {
    width: 40px;
    height: 40px;
  }
}
</style> 