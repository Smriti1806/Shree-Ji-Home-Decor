-- Add whatsapp message template + stock quantity
ALTER TABLE public.site_settings 
  ADD COLUMN IF NOT EXISTS whatsapp_template text NOT NULL DEFAULT 
'Hello {customer_name},

Thank you for your order with *Shree Ji Home Decor*!

*Order ID:* {order_id}
*Status:* {status}

*Items:*
{items}

*Subtotal:* {subtotal}
*Total:* {total}

Shipping address:
{address}

We will confirm shipping charges shortly. For any queries, reply to this message.';

ALTER TABLE public.site_settings 
  ADD COLUMN IF NOT EXISTS status_update_template text NOT NULL DEFAULT
'Hello {customer_name}, your Shree Ji order #{order_id} status is now: *{status}*. Thank you for shopping with us!';

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock_quantity integer;

-- Public order tracking RPC: returns minimal info for matching email or phone
CREATE OR REPLACE FUNCTION public.track_orders(_query text)
RETURNS TABLE (
  id uuid,
  customer_name text,
  order_status text,
  payment_status text,
  total_amount numeric,
  created_at timestamptz,
  item_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.id, o.customer_name, o.order_status, o.payment_status, o.total_amount, o.created_at,
    (SELECT COUNT(*) FROM public.order_items oi WHERE oi.order_id = o.id) AS item_count
  FROM public.orders o
  WHERE o.is_complete = true
    AND (lower(o.email) = lower(_query) OR regexp_replace(o.phone, '\D', '', 'g') = regexp_replace(_query, '\D', '', 'g'))
  ORDER BY o.created_at DESC
  LIMIT 20;
$$;

GRANT EXECUTE ON FUNCTION public.track_orders(text) TO anon, authenticated;