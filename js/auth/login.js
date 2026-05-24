import { authService } from './authService.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const submitBtn = document.getElementById('submit-btn');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // UI Feedback
        submitBtn.disabled = true;
        submitBtn.textContent = 'Cargando...';
        errorMessage.classList.add('hidden');

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            const result = await authService.login(email, password);
            if (result.success) {
                // Redirect back to returnUrl or home
                const urlParams = new URLSearchParams(window.location.search);
                const returnUrl = urlParams.get('returnUrl') || '/index.html';
                window.location.href = returnUrl;
            }
        } catch (error) {
            console.error('Login implementation error:', error);
            errorMessage.textContent = error.message || 'Error al iniciar sesión';
            errorMessage.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Iniciar Sesión';
        }
    });

    // Handle feedback messages from query params
    const urlParams = new URLSearchParams(window.location.search);
    const reason = urlParams.get('reason');
    if (reason === 'expired') {
        errorMessage.textContent = 'Tu sesión ha expirado. Por favor, ingresá nuevamente.';
        errorMessage.classList.remove('hidden');
        errorMessage.classList.replace('bg-red-50', 'bg-orange-50');
        errorMessage.classList.replace('text-red-500', 'text-orange-600');
    }
});
