class Cart {
  constructor(oldCart) {
    this.items = oldCart.items || {} // {} if the cart is new then {}
    this.totalQty = oldCart.totalQty || 0 // if the cart is new then 0
    this.totalPrice = oldCart.totalPrice || 0 // if the cart is new then 0
  }

  add(item, itemId) {
    let storedItem = this.items[itemId]
    if (!storedItem) {
      storedItem = this.items[itemId] = { item: item, qty: 0, price: 0 }
    }
    // console.log(storedItem.item.display_price)
    storedItem.qty++
    storedItem.price = storedItem.item.display_price * storedItem.qty
    this.totalQty++
    this.totalPrice += storedItem.item.display_price
  }
  subtract(itemId) {
    this.items[itemId].qty--
    this.items[itemId].price -= this.items[itemId].item.display_price
    this.totalQty--
    this.totalPrice -= this.items[itemId].item.display_price

    if (this.items[itemId].qty <= 0) {
      delete this.items[itemId]
    }
  }

  remove(itemId) {
    this.totalQty -= this.items[itemId].qty
    this.totalPrice -= this.items[itemId].price
    delete this.items[itemId]
  }

  generateArray() {
    //   returns current cart items as an array
    let arr = []
    for (const id in this.items) {
      arr.push(this.items[id])
    }
    return arr
  }
}

module.exports = {
  Cart,
}
