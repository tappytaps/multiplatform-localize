# translation-tool

Generates platform specific string resources (iOS, Android and Web) from xlsx files.

# Installation

```
npm i @tappytaps/translation-tool
```

# How to use it?

Go to your project:

```
$ cd path/to/your/project
```

Create and define configuration file:

```
$ touch .stringsgenrc
$ code .stringsgenrc
```

Run strings generator:

```
$ stringsgen
```

# Configuration

You provide your configuration via .stringsgenrc file.

```
{
    "xlsxUrl": "your_url_for_xlsx_file",
    "platform": "ios",
    "keysColumnName": "key_ios",
    "valuesColumnName": "value_en",
    "allowDuplicatesColumnName": "allow_duplicates",
    "descriptionColumnName": "description"
    "sheets": [
        {
            "name": "Sheet1",
            "output": "en.lproj/Sheet1.strings"
        },
        {
            "name": "Sheet2",
            "output": "en.lproj/Sheet2.strings"
        }
    ]
}
```
