import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ThemeService } from '../../shared/services/theme.service';
import { CHRONODLE_EVENT_ERAS } from '../../games/chronodle/chronodle.data';
import { RANKDLE_PUZZLES } from '../../games/rankdle/rankdle.data';
import { ARTICLES, RANKING_CONTEXT, KnowledgeArticle } from './knowledge.data';
import catalogSummary from '../../catalog-summary.json';

@Component({
  selector: 'app-knowledge',
  imports: [RouterLink, FooterComponent],
  templateUrl: './knowledge.component.html',
  styleUrl: './knowledge.component.css',
})
export class KnowledgeComponent {
  readonly data = inject(ActivatedRoute).snapshot.data;
  readonly kind = this.data['kind'] as string;
  readonly title = this.data['heading'] as string;
  readonly article: KnowledgeArticle | undefined = ARTICLES[this.data['article'] as string];
  readonly guides = Object.entries(ARTICLES).filter(([key]) => key !== 'como-jugar');
  readonly rankings = RANKDLE_PUZZLES;
  readonly ranking = RANKDLE_PUZZLES.find(item => item.id === this.data['ranking']);
  readonly rankingContext = this.ranking ? RANKING_CONTEXT[this.ranking.id] : [];
  readonly rankingItems = this.ranking ? [...this.ranking.items].sort((a, b) => a.value - b.value) : [];
  readonly history = [...CHRONODLE_EVENT_ERAS.flat()].sort((a, b) => a.date.localeCompare(b.date));
  readonly catalogs = catalogSummary;
  readonly faqs = [
    ['¿Necesito iniciar sesión?', 'Podés abrir y jugar las páginas públicas sin vincular una cuenta de Google. Algunas funciones sincronizan actividad mediante autenticación anónima de Firebase. Vincular una cuenta es una opción distinta de entrar a una sala.'],
    ['¿Por qué no aparece mi progreso en otro dispositivo?', 'Parte del progreso de tableros queda en el almacenamiento del navegador. La actividad sincronizada no equivale a copiar todos los estados de partida. Usar otro navegador, borrar datos o entrar en modo privado puede cambiar lo recuperado.'],
    ['¿Cuándo cambia la actividad diaria?', 'La fecha de Argentina se utiliza para registrar el desafío diario. Las rondas libres o ilimitadas no son nuevos días de actividad; consultá el indicador del modo antes de comparar resultados.'],
    ['¿Las guías revelan la respuesta de hoy?', 'Los ejemplos explican mecánicas y el archivo educativo es público. No consultan tu solución actual. Un dato del archivo puede aparecer en futuras rondas porque el catálogo de juego utiliza ese material.'],
    ['¿Por qué MusicDLE no reproduce una canción?', 'Los videos dependen de YouTube y pueden tener restricciones regionales o de reproducción incorporada. Si una entrada falla, el modo puede pasar a otra. Reportá el mensaje y la canción si la conocés; no es necesario compartir datos personales.'],
    ['¿Las cifras se actualizan en vivo?', 'Los juegos usan instantáneas locales. Población, altura u otros datos pueden diferir de referencias más recientes. Metodología identifica procedencia y fecha de generación cuando el catálogo la incluye.'],
    ['¿Cómo informo un dato incorrecto?', 'Escribí desde Contacto con el juego, dato cuestionado y una fuente concreta. Si es un error técnico, agregá el mensaje visible y dispositivo. No envíes contraseñas ni documentación sensible.'],
    ['¿Game-DLE pertenece a las marcas de sus juegos?', 'No. Es un proyecto independiente de Tobias Emiliano Moreno. League of Legends, One Piece, YouTube y las demás obras y marcas pertenecen a sus titulares.'],
  ];

  constructor() {
    const theme = inject(ThemeService);
    theme.setHeaderTheme('default');
    theme.setFooterTheme('default');
  }
}
