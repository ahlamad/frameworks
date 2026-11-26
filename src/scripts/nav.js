const header = document.querySelector("[data-header]");
const dialog = document.querySelector("#mobile-dialog");

if (header) {
    let lastScrollY = window.scrollY;
    let ticking = false;

    window.addEventListener(
        "scroll",
        () => {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;

                if (currentScrollY <= 0) {
                    header.classList.add("visible");
                } else if (currentScrollY > lastScrollY) {
                    header.classList.remove("visible");
                } else if (currentScrollY < lastScrollY) {
                    header.classList.add("visible");
                }

                lastScrollY = currentScrollY;
                ticking = false;
            });
        },
        { passive: true }
    );
}

if (dialog) {
    dialog.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", () => dialog.close());
    });

    dialog.addEventListener("keydown", (event) => {
        if (event.key !== "Tab" || !dialog.open) return;

        const focusbaar = [
            ...dialog.querySelectorAll("a[href], button:not([disabled])"),
        ].filter((el) => el.getClientRects().length > 0);

        const eerste = focusbaar[0];
        const laatste = focusbaar.at(-1);

        if (event.shiftKey && document.activeElement === eerste) {
            event.preventDefault();
            laatste.focus();
        }

        if (!event.shiftKey && document.activeElement === laatste) {
            event.preventDefault();
            eerste.focus();
        }
    });
}