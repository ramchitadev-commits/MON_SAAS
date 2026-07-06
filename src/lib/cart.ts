export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const isClient = () => typeof window !== 'undefined';

const getStorageKey = (slug: string) => `doole_cart_${slug}`;

// Longueur max tolérée pour une URL d'image dans le panier.
// Une vraie URL (Supabase Storage, CDN...) fait < 500 caractères ;
// une image Base64 en fait des dizaines de milliers.
const MAX_IMAGE_URL_LENGTH = 500;

// Le panier ne doit JAMAIS contenir de Base64 (data:...) : ça remplit
// instantanément le quota de 5 Mo du localStorage. On ne garde qu'une URL légère.
const sanitizeImage = (image: string): string => {
  if (!image) return '';
  if (image.startsWith('data:')) return ''; // image lourde encodée en Base64 → rejetée
  if (image.length > MAX_IMAGE_URL_LENGTH) return ''; // URL anormalement longue → rejetée
  return image;
};

// Récupérer le panier pour une boutique spécifique
export const getCart = (slug: string): CartItem[] => {
  if (!isClient()) return [];
  const stored = localStorage.getItem(getStorageKey(slug));
  return stored ? JSON.parse(stored) : [];
};

// Sauvegarder le panier — en cas de quota dépassé on retire les images
// plutôt que de faire planter l'application.
export const saveCart = (slug: string, items: CartItem[]): void => {
  if (!isClient()) return;
  try {
    localStorage.setItem(getStorageKey(slug), JSON.stringify(items));
  } catch {
    const stripped = items.map((item) => ({ ...item, image: '' }));
    try {
      localStorage.setItem(getStorageKey(slug), JSON.stringify(stripped));
    } catch {
      // localStorage saturé même sans images : on abandonne silencieusement
    }
  }
};

// Ajouter un produit au panier
export const addToCart = (
  slug: string,
  productId: string,
  name: string,
  price: number,
  image: string,
  quantity: number = 1
): CartItem[] => {
  const items = getCart(slug);
  const existingIndex = items.findIndex((item) => item.productId === productId);
  const safeImage = sanitizeImage(image);

  if (existingIndex >= 0) {
    items[existingIndex].quantity += quantity;
  } else {
    items.push({ productId, name, price, image: safeImage, quantity });
  }

  saveCart(slug, items);
  return items;
};

// Modifier la quantité d'un produit dans le panier
export const updateCartQuantity = (
  slug: string,
  productId: string,
  quantity: number
): CartItem[] => {
  let items = getCart(slug);
  const index = items.findIndex((item) => item.productId === productId);

  if (index >= 0) {
    if (quantity <= 0) {
      items = items.filter((item) => item.productId !== productId);
    } else {
      items[index].quantity = quantity;
    }
    saveCart(slug, items);
  }
  return items;
};

// Supprimer un produit du panier
export const removeFromCart = (slug: string, productId: string): CartItem[] => {
  const items = getCart(slug);
  const filtered = items.filter((item) => item.productId !== productId);
  saveCart(slug, filtered);
  return filtered;
};

// Vider le panier
export const clearCart = (slug: string): void => {
  if (!isClient()) return;
  localStorage.removeItem(getStorageKey(slug));
};

// Obtenir le total des articles dans le panier
export const getCartCount = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.quantity, 0);
};

// Obtenir le montant total du panier
export const getCartTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};
