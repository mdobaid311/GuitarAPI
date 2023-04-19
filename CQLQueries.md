# Get all rows

SELECT \* FROM container_details;

# Get all rows with a specific CONTAINER_DETAILS_KEY

select \* from container_details where "CONTAINER_DETAILS_KEY"='202211291628342935697871';

# Get

SELECT dateOf(order_date) as order_date,
       dateTrunc('hour', order_date) as order_hour,
       sum(original_order_total_amount) as total_sales
FROM orders
WHERE order_date >= '2023-04-14 00:00:00' AND order_date < '2023-04-15 00:00:00'
GROUP BY dateOf(order_date), dateTrunc('hour', order_date)
