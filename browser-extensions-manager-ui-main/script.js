document.addEventListener("DOMContentLoaded", function () {
  // ====================== VARIABLES AND CONSTANTS ======================
  const extensionList = document.getElementById("extensionList");
  const filterButtons = document.querySelectorAll(".button-states .btn");
  const modeToggle = document.querySelector(".mode-state");
  const modalOverlay = document.querySelector(".modal-overlay");
  const modalCancel = document.querySelector(".modal-cancel");
  const modalConfirm = document.querySelector(".modal-confirm");
  let extensions = [];
  let extensionToRemove = null;

  // ====================== MODAL FUNCTIONS ======================
  function showModal() {
      modalOverlay.classList.add("visible");
      document.body.style.overflow = "hidden";
  }

  function hideModal() {
      modalOverlay.classList.remove("visible");
      document.body.style.overflow = "";
      extensionToRemove = null;
  }

  // ====================== ANIMATION FUNCTIONS ======================
  function animateExtensionRemoval(element, callback) {
      element.classList.add("extension-exit");
      element.addEventListener("transitionend", callback, { once: true });
  }

  function animateExtensionAddition(element) {
      element.classList.add("extension-enter");
      // Trigger reflow to restart animation
      void element.offsetWidth;
      element.classList.remove("extension-enter");
  }

  // ====================== CORE FUNCTIONS ======================
  function loadExtensions() {
      extensionList.innerHTML = 
          '<div class="loading"><div class="loading-spinner"></div></div>';

      fetch("data.json")
          .then((response) => {
              if (!response.ok) throw new Error("Network response was not ok");
              return response.json();
          })
          .then((data) => {
              extensions = data;
              renderExtensions();
          })
          .catch((error) => {
              console.error("Error loading extensions:", error);
              extensionList.innerHTML = 
                  '<p class="error">Failed to load extensions. Please try again later.</p>';
          });
  }

  function renderExtensions(filter = "all") {
      extensionList.innerHTML = "";

      const filteredExtensions = extensions.filter((ext) => {
          if (filter === "all") return true;
          return filter === "active" ? ext.isActive : !ext.isActive;
      });

      if (filteredExtensions.length === 0) {
          extensionList.innerHTML = '<p class="no-extensions">No extensions found</p>';
          return;
      }

      filteredExtensions.forEach((extension) => {
          const extensionElement = document.createElement("div");
          extensionElement.className = "extension dark";
          extensionElement.innerHTML = `
              <div class="extension-info">
                  <img src="${extension.logo}" class="extension-logo" alt="${extension.name} logo">
                  <div>
                      <h3 class="extension-name dark">${extension.name}</h3>
                      <p class="extension-description dark">${extension.description}</p>
                  </div>
              </div>
              <div class="action-btn">
                  <button class="remove-btn dark">Remove</button>
                  <label class="switch">
                      <input type="checkbox" ${extension.isActive ? "checked" : ""}>
                      <span class="slider"></span>
                  </label>
              </div>
          `;
          extensionList.appendChild(extensionElement);
          animateExtensionAddition(extensionElement);
      });

      addToggleEventListeners();
      addRemoveEventListeners();
  }

  function addToggleEventListeners() {
      document.querySelectorAll(".switch input").forEach((toggle) => {
          toggle.addEventListener("change", function () {
              const extensionName = this.closest(".extension").querySelector(".extension-name").textContent;
              const extension = extensions.find((ext) => ext.name === extensionName);
              if (extension) extension.isActive = this.checked;
          });
      });
  }

  function addRemoveEventListeners() {
      document.querySelectorAll(".remove-btn").forEach((btn) => {
          btn.addEventListener("click", function (e) {
              e.stopPropagation();
              const extensionElement = this.closest(".extension");
              const extensionName = extensionElement.querySelector(".extension-name").textContent;
              extensionToRemove = { element: extensionElement, name: extensionName };
              showModal();
          });
      });
  }

  function initFilterButtons() {
      filterButtons.forEach((button) => {
          button.addEventListener("click", function () {
              filterButtons.forEach((btn) => btn.classList.remove("active-btn"));
              this.classList.add("active-btn");
              renderExtensions(this.dataset.filter);
          });
      });
  }

  function initDarkModeToggle() {
    modeToggle.addEventListener("click", function () {
      document.body.classList.toggle("dark");
      
      // Toggle dark class on all elements that need it
      document.querySelectorAll(".header, .extension, .extension-name, .extension-description, .remove-btn, .btn").forEach((el) => {
        el.classList.toggle("dark");
      });
    });
  }

  function initModalEvents() {
      modalCancel.addEventListener("click", hideModal);
      modalConfirm.addEventListener("click", function() {
          if (extensionToRemove) {
              animateExtensionRemoval(extensionToRemove.element, () => {
                  const extensionIndex = extensions.findIndex(
                      (ext) => ext.name === extensionToRemove.name
                  );
                  
                  if (extensionIndex !== -1) {
                      extensions.splice(extensionIndex, 1);
                      renderExtensions(
                          document.querySelector(".button-states .active-btn").dataset.filter
                      );
                  }
                  hideModal();
              });
          }
      });
      
      modalOverlay.addEventListener("click", function(e) {
          if (e.target === modalOverlay) hideModal();
      });
  }

  // ====================== INITIALIZATION ======================
  function init() {
      initFilterButtons();
      initDarkModeToggle();
      initModalEvents();
      loadExtensions();
  }

  init();
});