import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ThemeService } from '../../shared/services/theme.service';

type SiteInfoPage = 'about' | 'privacy' | 'terms' | 'contact';

@Component({
  selector: 'app-site-info',
  imports: [RouterLink, FooterComponent],
  templateUrl: './site-info.component.html',
  styleUrl: './site-info.component.css',
})
export class SiteInfoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly theme = inject(ThemeService);

  readonly page = this.route.snapshot.data['page'] as SiteInfoPage;
  readonly updatedAt = '25 de agosto de 2026';

  ngOnInit(): void {
    this.theme.setHeaderTheme('default');
    this.theme.setFooterTheme('default');
  }
}
