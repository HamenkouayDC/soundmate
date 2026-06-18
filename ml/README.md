# ML

Матчинг пользователей по музыкальному вкусу.

## Стек

- NumPy, scikit-learn — построение эмбеддингов
- Faiss — поиск похожих профилей
- Spotify API, Last.fm API, SoundCloud API — источники данных

## Структура

```
ml/
├── embeddings/       # построение векторов вкуса
├── matching/         # алгоритм матчинга
├── api_clients/      # клиенты для Spotify, Last.fm и др.
├── data/             # тестовые датасеты (не коммитить реальные данные)
└── requirements.txt
```
