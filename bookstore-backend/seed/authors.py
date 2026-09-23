"""Seed authors — 9 authors from src/data/mockBooks.ts"""
from sqlalchemy.orm import Session

from app.models.author import Author

AUTHORS = [
    {
        "id": "a1",
        "name": "Arjun Patel",
        "photo": "https://i.pravatar.cc/150?img=11",
        "bio": "Arjun Patel is a productivity coach and author based in Mumbai. With a passion for helping individuals unlock their full potential, Arjun has dedicated his career to teaching practical strategies for focus and success. He is the author of several bestselling self-help titles and speaks at corporate events across India.",
    },
    {
        "id": "a2",
        "name": "Raj Patel",
        "photo": "https://i.pravatar.cc/150?img=12",
        "bio": "Raj Patel is an educator and lifelong learner who believes that effective learning is a skill anyone can develop. His work draws on cognitive science and real-world experience to provide readers with actionable techniques for mastering new subjects quickly.",
    },
    {
        "id": "a3",
        "name": "James Wright",
        "photo": "https://i.pravatar.cc/150?img=13",
        "bio": "James Wright is a business strategist and bestselling author known for his clear, no-nonsense approach to achieving professional and personal goals. His books have sold over two million copies worldwide and have been translated into fifteen languages.",
    },
    {
        "id": "a4",
        "name": "James Adams",
        "photo": "https://i.pravatar.cc/150?img=14",
        "bio": "James Adams is an acclaimed fiction writer whose dark, atmospheric novels have earned him a devoted readership. His stories weave together history, mystery, and the complexities of human nature into deeply compelling narratives.",
    },
    {
        "id": "a5",
        "name": "Jessica Martin",
        "photo": "https://i.pravatar.cc/150?img=25",
        "bio": "Jessica Martin is a romance novelist celebrated for her heartfelt stories of love, loss, and second chances. Her novels consistently top the bestseller charts and have been adapted into award-winning films.",
    },
    {
        "id": "a6",
        "name": "Laura Mitchell",
        "photo": "https://i.pravatar.cc/150?img=26",
        "bio": "Laura Mitchell is a science writer and former aerospace engineer whose passion for space exploration shines through every page. She translates complex scientific concepts into accessible, thrilling narratives that inspire the next generation of explorers.",
    },
    {
        "id": "a7",
        "name": "Daniel Reed",
        "photo": "https://i.pravatar.cc/150?img=15",
        "bio": "Daniel Reed is a writer, minimalist, and productivity coach based in San Francisco. With a passion for intentional living, Daniel has dedicated his career to helping individuals simplify their lives — one habit, one space, and one thought at a time.",
    },
    {
        "id": "a8",
        "name": "Clara Nelson",
        "photo": "https://i.pravatar.cc/150?img=27",
        "bio": "Clara Nelson is a mystery and horror writer whose chilling tales have kept readers up well past midnight. Her atmospheric prose and intricate plots have earned her multiple literary awards and a global readership.",
    },
    {
        "id": "a9",
        "name": "Emily Parker",
        "photo": "https://i.pravatar.cc/150?img=28",
        "bio": "Emily Parker is a children's and young adult author who crafts stories of adventure, courage, and friendship. Her books have been translated into over twenty languages and are beloved by young readers around the world.",
    },
]


def seed_authors(db: Session) -> None:
    for data in AUTHORS:
        if not db.get(Author, data["id"]):
            db.add(Author(**data))
    db.commit()
    print(f"[seed] authors: {len(AUTHORS)} seeded")
