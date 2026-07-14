/**
 * Site manager for handling page-based editing following AI Studio pattern
 * Manages site state with pages array and activePageId
 */

import type { Page, Section } from "./page-types";

export interface Site {
  id: string;
  name: string;
  slug: string;
  pages?: Page[];
  activePageId?: string;
  sections?: Section[]; // Legacy - for backward compatibility
  contactWhatsApp?: string;
  logoUrl?: string;
  theme?: any;
  customCss?: string;
}

export function getActivePage(site: Site): Page | null {
  if (!site.pages || site.pages.length === 0) return null;
  const activeId = site.activePageId || site.pages[0].id;
  return site.pages.find(p => p.id === activeId) || site.pages[0];
}

export function getActiveSections(site: Site): Section[] {
  const activePage = getActivePage(site);
  if (activePage) {
    return activePage.sections;
  }
  // Fallback to legacy sections
  return site.sections || [];
}

export function updateActivePageSections(
  site: Site,
  updater: (sections: Section[]) => Section[]
): Site {
  if (!site.pages || site.pages.length === 0) {
    return {
      ...site,
      sections: updater(site.sections || [])
    };
  }

  const activeId = site.activePageId || site.pages[0].id;
  const updatedPages = site.pages.map(page => {
    if (page.id === activeId) {
      return {
        ...page,
        sections: updater(page.sections)
      };
    }
    return page;
  });

  // If home page is active, also update legacy sections for backward compatibility
  const isHomePage = activeId === 'home';
  const updatedSite = {
    ...site,
    pages: updatedPages
  };

  if (isHomePage) {
    const homePage = updatedPages.find(p => p.id === 'home');
    if (homePage) {
      updatedSite.sections = homePage.sections;
    }
  }

  return updatedSite;
}

export function switchPage(site: Site, pageId: string): Site {
  return {
    ...site,
    activePageId: pageId
  };
}

export function createPage(site: Site, name: string, slug: string): Site {
  const newPage: Page = {
    id: `page-${Date.now()}`,
    name,
    slug,
    sections: [
      { id: `header-${Date.now()}`, type: 'header', order: 1, props: { announcement: '', showWhatsAppHeader: true } },
      { id: `hero-${Date.now()}`, type: 'hero', order: 2, props: { title: name, subtitle: '', badge: '' } },
      { id: `footer-${Date.now()}`, type: 'footer', order: 3, props: { tagline: '' } }
    ],
    isSystem: false
  };

  return {
    ...site,
    pages: [...(site.pages || []), newPage],
    activePageId: newPage.id
  };
}

export function duplicatePage(site: Site, pageId: string): Site {
  const pageToDuplicate = site.pages?.find(p => p.id === pageId);
  if (!pageToDuplicate) return site;

  const duplicated: Page = {
    ...pageToDuplicate,
    id: `page-${Date.now()}`,
    name: `${pageToDuplicate.name} Copy`,
    slug: `${pageToDuplicate.slug}-copy`,
    sections: pageToDuplicate.sections.map(sec => ({
      ...sec,
      id: `${sec.id}-copy`
    })),
    isSystem: false
  };

  return {
    ...site,
    pages: [...(site.pages || []), duplicated],
    activePageId: duplicated.id
  };
}

export function deletePage(site: Site, pageId: string): Site {
  const pageToDelete = site.pages?.find(p => p.id === pageId);
  if (!pageToDelete || pageToDelete.isSystem) return site;

  const remainingPages = site.pages?.filter(p => p.id !== pageId) || [];
  const newActiveId = site.activePageId === pageId 
    ? (remainingPages[0]?.id || undefined) 
    : site.activePageId;

  return {
    ...site,
    pages: remainingPages,
    activePageId: newActiveId
  };
}
