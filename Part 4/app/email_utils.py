from flask_mail import Message
from app import mail

def send_receipt(to_email: str, order) -> None:
    """
    Sends a plain-text receipt to `to_email` for the given `order` object.
    Assumes `order.items` is an iterable of objects with attributes
    .name (str), .price (float), and .quantity (int).
    """
    # This is the construction of the message body
    
    lines = [
        "Thank you for your purchase at Tea Shop!",
        "",
        f"Order ID: {order.id}",
        "",
        "Items:"
    ]
    total = 0.0

    for oi in order.items:
        prod = oi.product               # your Product instance
        name = prod.name                # get the product name
        unit_price = oi.price           # price at time of order
        qty = oi.quantity
        subtotal = unit_price * qty

        lines.append(
            f" - {name}: ${unit_price:.2f} × {qty} = ${subtotal:.2f}"
        )
        total += subtotal

    lines.extend([
        "",
        f"Total amount: ${total:.2f}",
        "",
        "We appreciate your business! Come back soon.",
    ])

    msg = Message(
        subject=f"Your Tea Shop Receipt — Order #{order.id}",
        recipients=[to_email],
        body="\n".join(lines)
    )
    mail.send(msg)