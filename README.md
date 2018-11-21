# Yet Another Money Manager: Backend
This is a simple app meant to help people manage their money. You can import transactions from an IIF file (deplicates get ignored). 
Once transactions are imported you can manually categorize them, or you can define rules with regular expressions that determine what 
a transaction should categorize into. 

## Quick Start

```
git clone https://github.com/jcapinc/yamm
git clone https://github.com/jcapinc/yamm-frontend
cd yamm 
npm i
# duplicate `.env-example` file into a file called `.env` and configure it accordingly
npm run dev

# in a new terminal
cd yamm-frontend
npm i 
npm start
```