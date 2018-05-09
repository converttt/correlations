# Correlations
Correlation calculation and data analysis of historical market data of ETH and BTC

## What is a correlation
The correlation coefficient ranges between -1 and +1. A correlation of +1 implies that the two currency pairs will move in the same direction 100% of the time. A correlation of -1 implies the two currency pairs will move in the opposite direction 100% of the time. A correlation of zero implies that the relationship between the currency pairs is completely random.

![alt text](https://github.com/converttt/correlations/raw/master/media/screen-1.png 'An example of calculated data')

The upper table above shows that over the month of April (one month) BTC/USD and ETH/USD had a very strong positive correlation of 0.99. This implies that when the BTC/USD rallies, the ETH/USD has also rallied 99% of the time. Over the past six months, the correlation was weaker (0.51), but in the long run (one year) the two currency pairs still have a strong correlation.

## How to calculate a correlation
The correlation algorithm is published on [GeeksForGeeks](https://www.geeksforgeeks.org/program-find-correlation-coefficient/)

## What does this program do
Script **pipeline** retrieves historical data and calculates correlation for the past month, 3 months, 6 months and 1 year. Launch it on a monthly basis to process new data.
The server works as a reverse proxy to get the correlations for the requested month from the dataset with processed data.

Feel free to use the token in the config file, it is of a test account.

## OpenAPI specification
OpenAPI specification for the reverse proxy server is documented and should be available by the following url when the server is launched: http://localhost:{serverPort}/docs.

Currently available interfaces:
http://localhost:{serverPort}/v0/monitor
http://localhost:{serverPort}/v0/data
