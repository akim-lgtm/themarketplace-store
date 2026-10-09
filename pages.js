const pages = {
  about: {
    title: 'A marketplace with a little more heart.',
    eyebrow: 'OUR STORY',
    intro: 'We bring independent sellers and curious shoppers together, making it easier to discover considered finds for everyday life.',
    sections: [
      { title: 'Good things, thoughtfully found', text: 'From everyday style to the pieces that make a space feel like home, our marketplace is a place to explore useful, expressive finds from independent shops.' },
      { title: 'Made for discovery', text: 'Browse by category, save the things you love, and explore the men’s edit for easy layers, fresh graphics and everyday essentials.' },
      { title: 'A note about this preview', text: 'This is an independent storefront concept. It is not affiliated with, endorsed by, or a copy of any other fashion retailer. Product availability and seller information shown here are sample content.' }
    ]
  },
  shipping: {
    title: 'Shipping information',
    eyebrow: 'DELIVERY',
    intro: 'A clear guide to delivery for this storefront preview.',
    sections: [
      { title: 'A front-end preview', text: 'This demo does not take orders, calculate live shipping rates, dispatch parcels, or send tracking updates. Delivery messaging shown around the store is illustrative only.' },
      { title: 'Before a real launch', text: 'A live shop should publish its delivery regions, available services, dispatch estimates, shipping charges, tracking process, and any customs or duties information here.' },
      { title: 'Need help?', text: 'Use the contact page to see the available support options for this preview.' }
    ]
  },
  returns: {
    title: 'Returns & exchanges',
    eyebrow: 'HELP WITH AN ORDER',
    intro: 'The returns information for this storefront preview.',
    sections: [
      { title: 'A front-end preview', text: 'This demo does not accept or fulfill orders, so it cannot process a return, refund, or exchange.' },
      { title: 'Before a real launch', text: 'A live shop should set out the return window, eligible item conditions, exclusions, return shipping arrangements, refund timing, and the steps customers need to follow. Check local consumer-protection requirements before publishing a policy.' },
      { title: 'Questions', text: 'Visit the contact page for support information.' }
    ]
  },
  'size-guide': {
    title: 'Find your fit',
    eyebrow: 'MEN’S SIZE GUIDE',
    intro: 'Use these general body measurements as a starting point. The fit of each style can vary, so check the individual product details when shopping.',
    sections: [
      { title: 'Tops & jackets', table: [['Size', 'Chest (in)', 'Chest (cm)'], ['XS', '34–36', '86–91'], ['S', '36–38', '91–97'], ['M', '38–40', '97–102'], ['L', '40–42', '102–107'], ['XL', '42–44', '107–112'], ['XXL', '44–46', '112–117']] },
      { title: 'Bottoms', table: [['Size', 'Waist (in)', 'Waist (cm)'], ['XS', '26–28', '66–71'], ['S', '28–30', '71–76'], ['M', '30–32', '76–81'], ['L', '32–34', '81–86'], ['XL', '34–36', '86–91'], ['XXL', '36–38', '91–97']] },
      { title: 'How to measure', list: ['Chest: measure around the fullest part, keeping the tape level under your arms.', 'Waist: measure around your natural waist, without pulling the tape tight.', 'Between sizes? Choose the larger size for a more relaxed fit, or compare the garment measurements if provided.'] },
      { title: 'Please note', text: 'This is a general reference chart, not a guarantee of fit. Measurements and sizing conventions vary between brands and styles.' }
    ]
  },
  faq: {
    title: 'Frequently asked questions',
    eyebrow: 'HERE TO HELP',
    intro: 'Quick answers about browsing and using this storefront preview.',
    questions: [
      ['Can I place an order?', 'The storefront is a front-end demo. You can explore products and try the shopping bag, but checkout does not submit or fulfill an order.'],
      ['How do I find men’s clothing?', 'Choose Men in the main navigation or open the men’s edit. Use the category links to browse new arrivals, tops, jeans, jackets, sets, graphics, accessories, bottoms, and sale.'],
      ['How do I save an item?', 'Select the heart on a product card to add it to your wishlist. Your browser may keep the demo wishlist locally.'],
      ['Where can I find fit advice?', 'Open the Size guide page for general men’s body measurements and measuring tips.'],
      ['Can I return something?', 'No orders are placed through this demo. Return instructions will be published here when a real store policy is configured.'],
      ['How do I contact support?', 'Visit the Contact page for the support form preview and its current availability.']
    ]
  },
  contact: {
    title: 'Let’s talk',
    eyebrow: 'CONTACT',
    intro: 'Questions about the storefront? Send a note using this contact form preview.',
    sections: [
      { title: 'Support hours', text: 'A production storefront should list its staffed support hours and expected reply times here. No support inbox is connected to this demo.' }
    ],
    contactForm: true
  },
  privacy: {
    title: 'Privacy notice',
    eyebrow: 'YOUR INFORMATION',
    intro: 'This page is starter content for an independent storefront and must be reviewed and completed by the site owner before launch.',
    sections: [
      { title: 'What a real notice should explain', list: ['Which personal information the business collects and why.', 'Which service providers receive information, including account, analytics, payment, and delivery providers.', 'How long information is retained, how it is secured, and how customers can exercise their privacy rights.', 'How cookies or similar technologies are used and how customers can manage their choices.'] },
      { title: 'This preview', text: 'This static information page does not collect form submissions. The separate account experience may communicate with its configured authentication provider. Do not use this starter notice as a substitute for an accurate policy describing the deployed site.' }
    ]
  },
  terms: {
    title: 'Terms of use',
    eyebrow: 'PLEASE READ',
    intro: 'This page is a template outline, not legal advice or a final contract.',
    sections: [
      { title: 'Using this preview', text: 'This storefront is provided as a demonstration. Product names, descriptions, seller details, prices, and promotional messages are sample content and do not represent an offer to sell.' },
      { title: 'Before a real launch', list: ['Add the business name, registered address, and contact information.', 'Define account rules, ordering and payment terms, delivery, cancellations, returns, warranties, and dispute handling.', 'Explain intellectual property, acceptable use, liability limits, and governing law.', 'Have the final terms reviewed for the markets where the store operates.'] }
    ]
  }
};

const pageName = new URLSearchParams(window.location.search).get('page') || 'about';
const page = pages[pageName];
const content = document.querySelector('#info-content');

function renderSection(section) {
  let body = '';
  if (section.text) body += `<p>${section.text}</p>`;
  if (section.list) body += `<ul>${section.list.map(item => `<li>${item}</li>`).join('')}</ul>`;
  if (section.table) {
    const [head, ...rows] = section.table;
    body += `<div class="size-table-wrap"><table class="size-table"><thead><tr>${head.map(cell => `<th scope="col">${cell}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  return `<section class="info-section"><h2>${section.title}</h2>${body}</section>`;
}

function renderContactForm() {
  return '<p class="contact-demo-note" role="status">This preview does not have a support inbox connected. Contact options should be added here before launch.</p>';
}

function renderPage() {
  if (!page) {
    document.title = 'Page not found — TheMarketPlace';
    document.querySelector('#info-breadcrumb-current').textContent = 'Not found';
    content.innerHTML = '<p class="eyebrow">404 / NOT FOUND</p><h1>We couldn’t find that page.</h1><p>Try the men’s edit or browse all collections.</p><div class="info-cta-row"><a class="button button-dark" href="shop.html?category=men">Shop men <span aria-hidden="true">→</span></a><a class="text-link" href="shop.html">Browse everything</a></div>';
    return;
  }
  document.title = `${page.title} — TheMarketPlace`;
  document.querySelector('meta[name="description"]').content = page.intro;
  document.querySelector('#info-breadcrumb-current').textContent = page.eyebrow;
  content.innerHTML = `<p class="eyebrow">${page.eyebrow}</p><h1>${page.title}</h1><p class="info-intro">${page.intro}</p>${pageName === 'faq'
    ? `<div class="faq-list">${page.questions.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join('')}</div>`
    : `${page.sections.map(renderSection).join('')}${page.contactForm ? renderContactForm() : ''}`}`;
}

renderPage();
