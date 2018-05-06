# Correlations
Correlation calculation and data analysis of historical market data of ETH and BTC

## What is correlation
The correlation coefficient ranges between -1 and +1. A correlation of +1 implies that the two currency pairs will move in the same direction 100% of the time. A correlation of -1 implies the two currency pairs will move in the opposite direction 100% of the time. A correlation of zero implies that the relationship between the currency pairs is completely random.

![alt text](https://github.com/converttt/correlations/raw/master/media/screen-1.png 'An example of calculated data')

The upper table above shows that over the month of April (one month) BTC/USD and ETH/USD had a very strong positive correlation of 0.96. This implies that when the BTC/USD rallies, the ETH/USD has also rallied 96% of the time. Over the past six months, the correlation was weaker (0.63), but in the long run (one year) the two currency pairs still have a strong correlation.

## How to calculate correlation
The correlation algorithm is published on [GeeksForGeeks](https://www.geeksforgeeks.org/program-find-correlation-coefficient/)

## What does this program do
Script **pipeline** retrieves historical data and calculates correlation for the previous month. Launch it on a monthly basis to process new data for the previous month.
The server works as a reverse proxy to get the correlations for the requested month from the dataset with processed data.

Feel free to use the token in the config file, it is of a test account.