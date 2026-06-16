# Order-flow EXPLAIN ANALYZE resultaten

Uitgevoerd op: 2 juni 2026  
Database: PostgreSQL container `webshop-db`  
Database name: `webshop`  
Gebruikte testdata: `cart_id = 1`, `order_id = 1`

## Samenvatting

- De order placement query gebruikt `Bitmap Index Scan on idx_cart_items_cart_id`.
- De orderdetail query gebruikt `Bitmap Index Scan on idx_order_items_order_id`.
- De geavanceerde order-flow report query toont `WindowAgg`, `GroupAggregate`, CTE-logica, sortering en aggregatie.
- Alle drie queries zijn succesvol uitgevoerd met `EXPLAIN (ANALYZE, BUFFERS)`.

## 1. Order placement read phase

Deze query hoort bij `PlaceOrder()` en leest productprijs, voorraad en cart-aantal binnen de ordertransactie.

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT p.id, p.price, p.stock, ci.quantity
FROM   cart_items ci
JOIN   products   p ON p.id = ci.product_id
WHERE  ci.cart_id = 1
ORDER  BY p.id
FOR    UPDATE OF p;
```

Resultaat:

```text
LockRows  (cost=26.24..26.34 rows=8 width=40) (actual time=2.846..2.884 rows=1.00 loops=1)
  Buffers: shared hit=5 read=2 dirtied=1
  ->  Sort  (cost=26.24..26.26 rows=8 width=40) (actual time=1.185..1.188 rows=1.00 loops=1)
        Sort Key: p.id
        Sort Method: quicksort  Memory: 25kB
        Buffers: shared hit=4 read=2
        ->  Hash Join  (cost=14.47..26.12 rows=8 width=40) (actual time=1.118..1.121 rows=1.00 loops=1)
              Hash Cond: (p.id = ci.product_id)
              Buffers: shared hit=1 read=2
              ->  Seq Scan on products p  (cost=0.00..11.30 rows=130 width=30) (actual time=0.765..0.768 rows=5.00 loops=1)
                    Buffers: shared read=1
              ->  Hash  (cost=14.37..14.37 rows=8 width=14) (actual time=0.099..0.100 rows=1.00 loops=1)
                    Buckets: 1024  Batches: 1  Memory Usage: 9kB
                    Buffers: shared hit=1 read=1
                    ->  Bitmap Heap Scan on cart_items ci  (cost=4.21..14.37 rows=8 width=14) (actual time=0.073..0.075 rows=1.00 loops=1)
                          Recheck Cond: (cart_id = 1)
                          Heap Blocks: exact=1
                          Buffers: shared hit=1 read=1
                          ->  Bitmap Index Scan on idx_cart_items_cart_id  (cost=0.00..4.21 rows=8 width=0) (actual time=0.030..0.030 rows=1.00 loops=1)
                                Index Cond: (cart_id = 1)
                                Index Searches: 1
                                Buffers: shared read=1
Planning:
  Buffers: shared hit=148 read=1
Planning Time: 4.258 ms
Execution Time: 3.452 ms
```

Interpretatie:

De query gebruikt de index `idx_cart_items_cart_id` om cartregels voor de juiste winkelwagen op te halen. Daarna wordt naar `products` gejoined. De `LockRows` stap bevestigt dat `FOR UPDATE` actief is, wat belangrijk is voor voorraadconsistentie bij gelijktijdige bestellingen.

## 2. Orderdetail query

Deze query hoort bij `GetByID()` en haalt orderregels met productnaam en subtotalen op.

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT oi.id, oi.product_id, p.name, oi.quantity, oi.unit_price,
       oi.quantity * oi.unit_price AS subtotal
FROM   order_items oi
JOIN   products    p ON p.id = oi.product_id
WHERE  oi.order_id = 1;
```

Resultaat:

```text
Hash Join  (cost=14.44..26.31 rows=7 width=576) (actual time=2.231..2.237 rows=1.00 loops=1)
  Hash Cond: (p.id = oi.product_id)
  Buffers: shared hit=3
  ->  Seq Scan on products p  (cost=0.00..11.30 rows=130 width=520) (actual time=0.441..0.445 rows=5.00 loops=1)
        Buffers: shared hit=1
  ->  Hash  (cost=14.35..14.35 rows=7 width=28) (actual time=0.395..0.396 rows=1.00 loops=1)
        Buckets: 1024  Batches: 1  Memory Usage: 9kB
        Buffers: shared hit=2
        ->  Bitmap Heap Scan on order_items oi  (cost=4.21..14.35 rows=7 width=28) (actual time=0.027..0.028 rows=1.00 loops=1)
              Recheck Cond: (order_id = 1)
              Heap Blocks: exact=1
              Buffers: shared hit=2
              ->  Bitmap Index Scan on idx_order_items_order_id  (cost=0.00..4.21 rows=7 width=0) (actual time=0.012..0.012 rows=1.00 loops=1)
                    Index Cond: (order_id = 1)
                    Index Searches: 1
                    Buffers: shared hit=1
Planning:
  Buffers: shared hit=203
Planning Time: 3.333 ms
Execution Time: 2.600 ms
```

Interpretatie:

De query gebruikt `idx_order_items_order_id` om orderregels gericht op te halen. De subtotal wordt in SQL berekend met `oi.quantity * oi.unit_price`, waardoor de database de orderregelberekening uitvoert en de applicatie geen losse productprijs hoeft terug te rekenen.

## 3. Geavanceerde order-flow report query

Deze query hoort bij `OrderRepository.OrderFlowReport()` en is beschikbaar via `GET /admin/orders/report`.

```sql
EXPLAIN (ANALYZE, BUFFERS)
WITH order_line_totals AS (
    SELECT
        o.id AS order_id,
        COUNT(oi.id) AS item_count,
        COUNT(DISTINCT oi.product_id) AS distinct_product_count,
        COALESCE(SUM(oi.quantity), 0) AS total_quantity
    FROM   orders o
    LEFT   JOIN order_items oi ON oi.order_id = o.id
    GROUP  BY o.id
),
order_rankings AS (
    SELECT
        o.id,
        o.user_id,
        o.status,
        o.order_date,
        o.total_amount,
        ROW_NUMBER() OVER (
            PARTITION BY o.user_id
            ORDER BY o.order_date, o.id
        ) AS user_order_number,
        SUM(o.total_amount) OVER (
            PARTITION BY o.user_id
        ) AS user_lifetime_value,
        AVG(o.total_amount) OVER (
            PARTITION BY o.user_id
        ) AS average_order_value
    FROM orders o
)
SELECT
    r.id,
    r.user_id,
    r.status,
    r.order_date,
    r.total_amount,
    olt.item_count,
    olt.distinct_product_count,
    olt.total_quantity,
    (r.user_order_number = 1) AS first_order_for_user,
    r.user_order_number,
    r.user_lifetime_value,
    r.average_order_value
FROM   order_rankings r
JOIN   order_line_totals olt ON olt.order_id = r.id
ORDER  BY r.order_date DESC, r.id DESC;
```

Resultaat:

```text
Sort  (cost=256.44..257.94 rows=600 width=187) (actual time=0.872..0.875 rows=4.00 loops=1)
  Sort Key: o.order_date DESC, o.id DESC
  Sort Method: quicksort  Memory: 25kB
  Buffers: shared hit=9
  ->  Hash Join  (cost=201.76..228.75 rows=600 width=187) (actual time=0.565..0.575 rows=4.00 loops=1)
        Hash Cond: (o.id = olt.order_id)
        Buffers: shared hit=3
        ->  WindowAgg  (cost=43.79..67.69 rows=600 width=162) (actual time=0.345..0.353 rows=4.00 loops=1)
              Window: w2 AS (PARTITION BY o.user_id)
              Storage: Memory  Maximum Storage: 17kB
              Buffers: shared hit=1
              ->  WindowAgg  (cost=43.71..57.19 rows=600 width=98) (actual time=0.136..0.141 rows=4.00 loops=1)
                    Window: w1 AS (PARTITION BY o.user_id ORDER BY o.order_date, o.id ROWS UNBOUNDED PRECEDING)
                    Storage: Memory  Maximum Storage: 17kB
                    Buffers: shared hit=1
                    ->  Sort  (cost=43.69..45.19 rows=600 width=90) (actual time=0.116..0.116 rows=4.00 loops=1)
                          Sort Key: o.user_id, o.order_date, o.id
                          Sort Method: quicksort  Memory: 25kB
                          Buffers: shared hit=1
                          ->  Seq Scan on orders o  (cost=0.00..16.00 rows=600 width=90) (actual time=0.101..0.102 rows=4.00 loops=1)
                                Buffers: shared hit=1
        ->  Hash  (cost=150.48..150.48 rows=600 width=28) (actual time=0.135..0.136 rows=4.00 loops=1)
              Buckets: 1024  Batches: 1  Memory Usage: 9kB
              Buffers: shared hit=2
              ->  Subquery Scan on olt  (cost=121.48..150.48 rows=600 width=28) (actual time=0.129..0.132 rows=4.00 loops=1)
                    Buffers: shared hit=2
                    ->  GroupAggregate  (cost=121.48..144.48 rows=600 width=28) (actual time=0.128..0.130 rows=4.00 loops=1)
                          Group Key: o_1.id
                          Buffers: shared hit=2
                          ->  Sort  (cost=121.48..124.88 rows=1360 width=16) (actual time=0.123..0.124 rows=4.00 loops=1)
                                Sort Key: o_1.id, oi.product_id
                                Sort Method: quicksort  Memory: 25kB
                                Buffers: shared hit=2
                                ->  Hash Right Join  (cost=23.50..50.69 rows=1360 width=16) (actual time=0.109..0.112 rows=4.00 loops=1)
                                      Hash Cond: (oi.order_id = o_1.id)
                                      Buffers: shared hit=2
                                      ->  Seq Scan on order_items oi  (cost=0.00..23.60 rows=1360 width=16) (actual time=0.005..0.005 rows=4.00 loops=1)
                                            Buffers: shared hit=1
                                      ->  Hash  (cost=16.00..16.00 rows=600 width=4) (actual time=0.009..0.010 rows=4.00 loops=1)
                                            Buckets: 1024  Batches: 1  Memory Usage: 9kB
                                            Buffers: shared hit=1
                                            ->  Seq Scan on orders o_1  (cost=0.00..16.00 rows=600 width=4) (actual time=0.005..0.005 rows=4.00 loops=1)
                                                  Buffers: shared hit=1
Planning:
  Buffers: shared hit=182 read=4
Planning Time: 2.519 ms
Execution Time: 2.123 ms
```

Interpretatie:

Deze query is vooral bedoeld als geavanceerd SQL-bewijs. Het queryplan toont `WindowAgg` voor `ROW_NUMBER`, `SUM OVER` en `AVG OVER`, en `GroupAggregate` voor orderregelstatistieken. Omdat de testdatabase maar vier orders bevat, kiest PostgreSQL voor sommige onderdelen bewust een sequential scan; bij deze kleine datavolume is dat goedkoper dan indexgebruik. Dat is normaal gedrag van de query planner.
