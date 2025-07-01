# 画像を保存するディレクトリを作成
$outputDir = "public/images/tiles"
New-Item -ItemType Directory -Force -Path $outputDir

# 数牌の画像をダウンロード
$suits = @{
    "man" = "萬子"
    "pin" = "筒子"
    "sou" = "索子"
}

foreach ($suit in $suits.Keys) {
    for ($i = 1; $i -le 9; $i++) {
        $url = "https://mj-king.net/sozai/$($suits[$suit])/$i.gif"
        $outputFile = "$outputDir/$i$suit.gif"
        Write-Host "Downloading $url to $outputFile"
        Invoke-WebRequest -Uri $url -OutFile $outputFile
    }
}

# 字牌の画像をダウンロード
$honors = @{
    "ton" = "字牌/ton.gif"
    "nan" = "字牌/nan.gif"
    "sha" = "字牌/sha.gif"
    "pei" = "字牌/pei.gif"
    "haku" = "字牌/haku.gif"
    "hatsu" = "字牌/hatsu.gif"
    "chun" = "字牌/chun.gif"
}

foreach ($honor in $honors.Keys) {
    $url = "https://mj-king.net/sozai/$($honors[$honor])"
    $outputFile = "$outputDir/$honor.gif"
    Write-Host "Downloading $url to $outputFile"
    Invoke-WebRequest -Uri $url -OutFile $outputFile
} 