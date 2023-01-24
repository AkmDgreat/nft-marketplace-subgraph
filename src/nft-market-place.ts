import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  ItemBought as ItemBoughtEvent,
  ItemCanceled as ItemCanceledEvent,
  ItemListed as ItemListedEvent
} from "../generated/NftMarketPlace/NftMarketPlace"
import { ItemBought, ItemCanceled, ItemListed, ActiveItem, } from "../generated/schema"

// When the ItemBought event is fired, execute the following function
export function handleItemBought(event: ItemBoughtEvent): void {

  //We need to: Save the event in TheGraph & update our ActiveItem
  //To do this: get/create an itemListed object.
  //Each item needs a unique ID
  let uniqueId = getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  let itemBought = ItemBought.load(uniqueId)
  let activeItem = ActiveItem.load(uniqueId)

  if (!itemBought) { itemBought = new ItemBought(uniqueId) } //if itemBought doesn't exist, create a new instance of ItemBought 

  //ItemBoughtEvent is the raw event. ItemBoughtObject is saved in theGraph
  //This is how we save item event as an object:
  itemBought.buyer = event.params.buyer
  itemBought.nftAddress = event.params.nftAddress
  itemBought.tokenId = event.params.tokenId
  activeItem!.buyer = event.params.buyer //activeItem now has a buyer == activeItem is bought == this item is not available anymore

  itemBought.save()
  activeItem!.save()

}

export function handleItemCanceled(event: ItemCanceledEvent): void {
  let uniqueId = getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  let itemcanceled = ItemCanceled.load(uniqueId)
  let activeItem = ActiveItem.load(uniqueId) 

  if (!itemcanceled) {
    itemcanceled = new ItemCanceled(uniqueId)
  }

  itemcanceled.seller = event.params.seller
  itemcanceled.nftAddress = event.params.nftAddress
  itemcanceled.tokenId = event.params.tokenId
  activeItem!.buyer = Address.fromString("0x000000000000000000000000000000000000dEaD")// dead address 
  // if the buyer == dead address, then the item has been cancelled
  // If buyer == null address, then the item is still in the marketplace // null address == "0x0000000000000000000000000000000000000000"
  // If buyer == some address, then the item has been bought by that address

  itemcanceled.save()
  activeItem!.save()

}

export function handleItemListed(event: ItemListedEvent): void {
  let uniqueId = getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  let itemListed = ItemListed.load(uniqueId)
  let activeItem = ActiveItem.load(uniqueId) // if an item already exists

  if (!itemListed) { itemListed = new ItemListed(uniqueId) }
  if (!activeItem) { activeItem = new ActiveItem(uniqueId) } //If there are no active items, create a new item

  itemListed.seller = event.params.seller
  activeItem.seller = event.params.seller

  itemListed.nftAddress = event.params.nftAddress
  activeItem.nftAddress = event.params.nftAddress

  itemListed.tokenId = event.params.tokenId
  activeItem.tokenId = event.params.tokenId

  itemListed.price = event.params.price
  activeItem.price = event.params.price

  activeItem.buyer = Address.fromString("0x0000000000000000000000000000000000000000")

  itemListed.save()
  activeItem.save()
}

function getIdFromEventParams(tokenId: BigInt, nftAddress: Address): string {
  return tokenId.toHexString() + nftAddress.toHexString()
  // TokenId + nftaddress is a unique combo
}

/* let entity = new ItemBought(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.buyer = event.params.buyer
  entity.nftAddress = event.params.nftAddress
  entity.tokenId = event.params.tokenId
  entity.price = event.params.price

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save() */
