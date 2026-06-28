export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const isClient = () => typeof window !== 'undefined';

const getStorageKey = (slug: string) => `doole_cart_${slug}`;

// Récupérer le panier pour une boutique spécifique
export const getCart = (slug: string): CartItem[] => {
  if (!isClient()) return [];
  const stored = localStorage.getItem(getStorageKey(slug));
  return stored ? JSON.parse(stored) : [];
};

// Sauvegarder le panier pour une boutique spécifique
export const saveCart = (slug: string, items: CartItem[]): void => {
  if (!isClient()) return;
  localStorage.setItem(getStorageKey(slug), JSON.stringify(items));
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

  if (existingIndex >= 0) {
    items[existingIndex].quantity += quantity;
  } else {
    items.push({ productId, name, price, image, quantity });
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
