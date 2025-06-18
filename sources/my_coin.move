module my_coin::my_custom_coin;

use sui::coin::{Self, TreasuryCap};

//move resource type
public struct MY_CUSTOM_COIN has drop {}

fun init(witness: MY_CUSTOM_COIN, ctx: &mut TxContext) {
    let (treasury, metadata) = coin::create_currency(
        witness,
        6,
        b"MCC",
        b"My Custom Token",
        b"",
        option::none(),
        ctx,
    );
	//make metadata immutable
    transfer::public_freeze_object(metadata);
	//transfer initial supply to sender
    transfer::public_transfer(treasury, ctx.sender())
}


public fun mint(
    treasury_cap: &mut TreasuryCap<MY_CUSTOM_COIN>,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext,
) {
    let coin = coin::mint(treasury_cap, amount, ctx);
    transfer::public_transfer(coin, recipient)
}
