class Cart {
  constructor(oldCart) {
    this.items = oldCart.items || {} // {} if the cart is new then {}
    this.totalQty = oldCart.totalQty || 0 // if the cart is new then 0
    this.subtotalPrice = oldCart.subtotalPrice || 0 // if the cart is new then 0
    this.shippingPrice = 10
    this.discount = 10
    this.totalPrice = this.subtotalPrice + this.shippingPrice - this.discount

    console.log('inside Cart object: ', this.totalPrice)
    this.tradeCredit = 15
    this.finalPrice = this.totalPrice - this.tradeCredit
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
    this.subtotalPrice += storedItem.item.display_price
  }
  subtract(itemId) {
    this.items[itemId].qty--
    this.items[itemId].price -= this.items[itemId].item.display_price
    this.totalQty--
    this.subtotalPrice -= this.items[itemId].item.display_price

    if (this.items[itemId].qty <= 0) {
      delete this.items[itemId]
    }
  }

  remove(itemId) {
    this.totalQty -= this.items[itemId].qty
    this.subtotalPrice -= this.items[itemId].price
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
