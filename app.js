lucide.createIcons();

const track = (event, detail = {}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...detail });
  window.dispatchEvent(new CustomEvent('portfolio:conversion', { detail: { event, ...detail } }));
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
document.getElementById('year').textContent = new Date().getFullYear();

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

const progressBar = document.getElementById('scroll-progress');
const scrollMilestones = new Set();
const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = `${progress}%`;
  [25, 50, 75, 100].forEach((milestone) => {
    if (progress >= milestone && !scrollMilestones.has(milestone)) {
      scrollMilestones.add(milestone);
      track('scroll_depth', { percent: milestone });
    }
  });
};
document.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const mobileCta = document.querySelector('[data-mobile-cta]');
const intentLabels = { general: 'Contame que pasa', urgent: 'Resolver algo urgente', automation: 'Automatizar una tarea', system: 'Ver una solucion', discovery: 'Ver donde ahorrar tiempo' };
document.querySelectorAll('.wa-link').forEach((link) => {
  link.addEventListener('click', () => {
    const intent = link.dataset.intent || 'general';
    track('whatsapp_click', { intent, placement: link.closest('section')?.id || 'header' });
    if (intent === 'discovery') track('opportunity_diagnosis_click', { placement: link.closest('section')?.id || 'hero' });
  });
});

document.querySelectorAll('.problem-option').forEach((option) => {
  const heroVisual = document.querySelector('.hero-visual');
  const setHeroFocus = () => {
    if (mobileCta) mobileCta.textContent = intentLabels[option.dataset.intent];
    if (heroVisual) heroVisual.dataset.focus = option.dataset.intent;
  };
  const clearHeroFocus = () => {
    if (mobileCta) mobileCta.textContent = intentLabels.discovery;
    if (heroVisual) delete heroVisual.dataset.focus;
  };
  option.addEventListener('mouseenter', setHeroFocus);
  option.addEventListener('mouseleave', clearHeroFocus);
  option.addEventListener('focus', setHeroFocus);
  option.addEventListener('blur', clearHeroFocus);
  option.addEventListener('click', () => track('problem_selected', { intent: option.dataset.intent }));
});

const selectedSymptoms = new Set();
const symptomResult = document.getElementById('symptom-result');
const diagnosisLink = symptomResult?.querySelector('a');
document.querySelectorAll('.symptom').forEach((symptom) => {
  symptom.addEventListener('click', () => {
    const isSelected = symptom.classList.toggle('is-selected');
    symptom.setAttribute('aria-pressed', String(isSelected));
    if (isSelected) selectedSymptoms.add(symptom.textContent.trim());
    else selectedSymptoms.delete(symptom.textContent.trim());
    symptomResult.hidden = selectedSymptoms.size === 0;
    if (selectedSymptoms.size && diagnosisLink) {
      const text = `Hola Matias, identifique estas situaciones en mi negocio: ${[...selectedSymptoms].join(' ')} Quiero contarte el proceso.`;
      diagnosisLink.href = `https://wa.me/5491131060429?text=${encodeURIComponent(text)}`;
      track('symptom_selected', { count: selectedSymptoms.size });
    }
  });
});

document.querySelectorAll('.faq-list details').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    document.querySelectorAll('.faq-list details[open]').forEach((other) => { if (other !== item) other.open = false; });
    track('faq_opened', { question: item.querySelector('summary')?.textContent.trim() });
  });
});

const processSection = document.querySelector('#como-trabajamos');
if (processSection) {
  new IntersectionObserver((entries, processObserver) => {
    if (!entries[0].isIntersecting) return;
    processSection.classList.add('is-seen');
    processObserver.disconnect();
  }, { threshold: 0.35 }).observe(processSection);
}

const navLinks = [...document.querySelectorAll('.site-header nav a')];
const navigableSections = navLinks.map((link) => document.querySelector(link.hash)).filter(Boolean);
new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach((link) => link.classList.toggle('is-active', link.hash === `#${visible.target.id}`));
}, { rootMargin: '-25% 0px -60% 0px', threshold: [0.1, 0.4] }).observe(navigableSections[0]);
navigableSections.slice(1).forEach((section) => new IntersectionObserver((entries) => {
  const entry = entries[0];
  if (!entry.isIntersecting) return;
  navLinks.forEach((link) => link.classList.toggle('is-active', link.hash === `#${entry.target.id}`));
}, { rootMargin: '-25% 0px -60% 0px', threshold: 0.1 }).observe(section));

document.querySelectorAll('.project-actions a, .github-link').forEach((link) => {
  link.addEventListener('click', () => track(link.classList.contains('action-live') ? 'case_demo_opened' : 'case_repo_opened', { project: link.closest('.project')?.querySelector('h3')?.textContent.trim() || 'GitHub' }));
});

const canHover = window.matchMedia('(pointer: fine)').matches;
if (canHover) {
  document.querySelectorAll('.floating-whatsapp').forEach((el) => {
    el.addEventListener('mousemove', (event) => {
      const rect = el.getBoundingClientRect();
      el.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * 0.18}px, ${(event.clientY - rect.top - rect.height / 2) * 0.18}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}