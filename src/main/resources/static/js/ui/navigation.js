
const SECTION_IDS = [
    "home",
    "book",
    "about",
    "reviews",
    "contact",
    "mybookings"
];

export function initNavigation() {
    const sections = SECTION_IDS
        .map(id => document.getElementById(id))
        .filter(section => section !== null);

    function showSection(sectionId) {
        sections.forEach(section => {
            section.classList.toggle(
                "hidden",
                section.id !== sectionId
            );
        });

        history.replaceState(null, "", `#${sectionId}`);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    // Handle navigation links and buttons anywhere on the page.
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        const sectionId = link.getAttribute("href").substring(1);

        if (!SECTION_IDS.includes(sectionId)) {
            return;
        }

        link.addEventListener("click", event => {
            event.preventDefault();
            showSection(sectionId);
        });
    });

    // Restore the section from the URL.
    const initialSection = window.location.hash.substring(1);

    showSection(
        SECTION_IDS.includes(initialSection)
            ? initialSection
            : "home"
    );
}
