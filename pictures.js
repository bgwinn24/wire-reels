// Picture format: name + rows of chars. '.' = empty. Add a picture here to add a level.
(function(root){
const PALETTE={Y:'#f2c230',O:'#e8792b',R:'#d8402f',B:'#2f7fd6',G:'#3fa34d',W:'#efe6d2',S:'#a9b1ba',K:'#5b6470',N:'#9a6534'};
const PICTURES=[
['Lightning Bolt',['......YYYY','.....YYYY.','....YYYY..','...YYYY...','..YYYYYYYY','.YYYYYYYY.','.....YYY..','....YYY...','...YYY....','..YYO.....','.YYO......','YYO.......'],'O'],
['Light Bulb',['...YYYY...','..YWYYYY..','.YWYYYYYY.','.YWYYYYYY.','.YYYYYYYY.','.YYYOOYYY.','..YYOOYY..','...YOOY...','...SSSS...','...KKKK...','...SSSS...','....KK....'],'O'],
['Electrical Tape',['...BBBBBB...','..BBBBBBBB..','.BBBBWWBBBB.','.BBB....BBB.','BBB......BBB','BBB......BBB','BBB......BBB','.BBB....BBB.','.BBBBBBBBBB.','..BBBBBBBB..','...BBBBBB...'],'K'],
['Hammer',['.SSSSSSSSS..','.SSSSSSSSSSS','.SSSSSSSSS..','....NN......','....NN......','....NN......','....NN......','....NN......','....RR......','....RR......','....RR......'],'K'],
['Screwdriver',['..........SS','.........SS.','........SS..','.......SS...','......SS....','.....KK.....','....YYY.....','...YYYY.....','..YYYY......','.YYYY.......','YYYY........','YYY.........']],
['Plug',['..S....S..','..S....S..','..S....S..','.KKKKKKKK.','.KBBBBBBK.','.KBWBBBBK.','.KBBBBBBK.','..KBBBBK..','...KBBK...','....KK....','....KK....','....KK....']],
['LED',['...RRRR...','..RRRRRR..','.RRWRRRRR.','.RWRRRRRR.','.RRRRRRRR.','.RRRRRRRR.','.RRRRRRRR.','SSSSSSSSSS','...S..S...','...S..S...','...S...S..','...S...S..'],'K'],
['Hard Hat',['....YYYY....','..YYYWYYYY..','.YYYYWYYYYY.','.YYYYWYYYYY.','YYYYYWYYYYYY','YYYYYYYYYYYY','OOOOOOOOOOOO','OOOOOOOOOOOO'],'R'],
['Wrench',['.SS....SS...','.SS....SS...','.SSS..SSS...','..SSSSSS....','...SSSS.....','....SS......','....SS......','....BB......','....GG......','....BB......','...GGGG.....','...BBBB.....']],
['Light Switch',['.WWWWWWWW.','.WSSSSSSW.','.WSWWWWSW.','.WSWRRWSW.','.WSWRRWSW.','.WSWWWWSW.','.WSWKKWSW.','.WSWKKWSW.','.WSWWWWSW.','.WSSSSSSW.','.WWWWWWWW.']],
['Wire Nut',['...OOOO...','..OOOOOO..','..OWOOOO..','.OOWOOOOO.','.OOOOOOOO.','.OWOOOOOO.','OOOOOOOOOO','..SSSSSS..','..SRSSBS..','...R..B...','...R..B...','...R..B...'],'R'],
['Battery',['.....SS.....','..KKKKKKKK..','..KGGGGGGK..','..KGWWGGGK..','..KGGGGGGK..','..KKKKKKKK..','..KYYYYYYK..','..KYYYYYYK..','..KYYYYYYK..','..KKKKKKKK..'],'S'],
['Outlet',['WWWWWWWWWW','WSSSSSSSSW','WSKSSSSKSW','WSKSSSSKSW','WSSSKKSSSW','WSSSSSSSSW','WSSSSSSSSW','WSKSSSSKSW','WSKSSSSKSW','WSSSKKSSSW','WSSSSSSSSW','WWWWWWWWWW']],
['Flashlight',['.YY.........','YYYS........','YYYSS.......','YYYSKKKKKKK.','YYYSKBBBBBK.','YYYSKBBBBBK.','YYYSKKKKKKK.','YYYSS.......','YYYS........','.YY.........'],'W'],
['Pliers',['..KK....KK..','..SS....SS..','...SS..SS...','....SSSS....','.....KK.....','....RKKR....','...RR..RR...','...RR..RR...','..RR....RR..','..RR....RR..','.RR......RR.','.RR......RR.']],
['Toolbox',['....KKKK....','...K....K...','...K....K...','RRRRRRRRRRRR','RRRRRRRRRRRR','KKKKKYYKKKKK','RRRRRYYRRRRR','RRRRRRRRRRRR','RRRRRRRRRRRR','RRRRRRRRRRRR','KKKKKKKKKKKK'],'N'],
['Cord Coil',['...OOOOOO...','..OO....OO..','.OO.GGGG.OO.','.O.GG..GG.O.','.O.G.RR.G.O.','.O.G.RR.G.O.','.O.GG..GG.O.','.OO.GGGG.OO.','..OO....OO..','...OOOOOO...','....KKKK....','...KKKKKK...']],
['Power Pole',['NNNNNNNNNNNN','.G..NN..G...','.G..NN..G...','....NN......','NNNNNNNNNNNN','.G..NN..G..G','.G..NN..G..G','....KK......','....KK......','....KK......','...KKKK.....']],
['Breaker Panel',['SSSSSSSSSS','SKKKKKKKKS','SKWWKKRRKS','SKKKKKKKKS','SKWWKKWWKS','SKKKKKKKKS','SKRRKKWWKS','SKKKKKKKKS','SKWWKKWWKS','SKKKKKKKKS','SSSSSSSSSS']],
['Multimeter',['.KKKKKKKKKK.','.KGGGGGGGGK.','.KGWWGGWWGK.','.KGGGGGGGGK.','.KKKKKKKKKK.','.KYYYYYYYYK.','.KYYYKKYYYK.','.KYYKSSKYYK.','.KYYYKKYYYK.','.KYYYYYYYYK.','.KRYYYYYYBK.','.KKKKKKKKKK.']],
];
root.PALETTE=PALETTE;root.PICTURES=PICTURES;
if(typeof module!=='undefined')module.exports={PALETTE,PICTURES};
})(typeof window!=='undefined'?window:globalThis);
